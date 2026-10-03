using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using OpenAI;
using OpenAI.Chat;
using System;
using System.ClientModel;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

class Program
{
    static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        // 1. Enable CORS for frontend requests
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowWebsite", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        // 2. Load Configuration & API Keys
        string apiKey = builder.Configuration["OpenRouterApiKey"]
            ?? Environment.GetEnvironmentVariable("OPENROUTER_API_KEY")
            ?? throw new InvalidOperationException("Set OpenRouterApiKey or OPENROUTER_API_KEY before running.");

        string dbConnectionString = builder.Configuration.GetConnectionString("PostgreSQL")
            ?? "Host=localhost;Port=5432;Database=Hackaton;Username=postgres;Password=12345%$#@!";

        string modelName = "meta-llama/llama-3.1-8b-instruct:groq";

        // ⚡ Singleton Registration for ChatClient to reuse connections and reduce latency
        builder.Services.AddSingleton<ChatClient>(sp =>
        {
            OpenAIClientOptions options = new OpenAIClientOptions
            {
                Endpoint = new Uri("https://openrouter.ai/api/v1")
            };
            return new ChatClient(modelName, new ApiKeyCredential(apiKey), options);
        });

        WebApplication app = builder.Build();
        app.UseCors("AllowWebsite");

        // GET /api/menu
        app.MapGet("/api/menu", async () =>
        {
            try
            {
                MenuRepository repo = new MenuRepository(dbConnectionString);
                List<MenuItem> meniuComplet = await repo.GetMenuItemsAsync();

                Console.WriteLine($"[MENU GET]: Trimis {meniuComplet.Count} preparate către site.");
                return Results.Ok(meniuComplet);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EROARE GET MENU]: {ex.Message}");
                return Results.Problem($"Eroare la citirea meniului: {ex.Message}");
            }
        });

        // GET /api/users/{qrCode}
        app.MapGet("/api/users/{qrCode}", async (string qrCode) =>
        {
            try
            {
                UserRepository userRepo = new UserRepository(dbConnectionString);
                UserProfileDto? user = await userRepo.GetUserByQrCodeAsync(qrCode);

                if (user == null)
                {
                    Console.WriteLine($"[QR CODE GET]: Userul cu codul '{qrCode}' nu a fost găsit.");
                    return Results.NotFound(new { error = "Utilizatorul nu a fost găsit." });
                }

                Console.WriteLine($"[QR CODE GET]: Identificat user: {user.Name} ({user.Allergies.Count} alergii)");
                return Results.Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EROARE QR USER]: {ex.Message}");
                return Results.Problem($"Eroare server: {ex.Message}");
            }
        });

        // POST /api/recommendations (Reuses injected ChatClient)
        app.MapPost("/api/recommendations", async (UserRecommendationRequest request, ChatClient client) =>
        {
        try
        {
            string userId = request.UserId ?? "GUEST";
            string allergiesText = (request.Allergies != null && request.Allergies.Count > 0)
                ? string.Join(", ", request.Allergies)
                : "Fără alergii declarate";

            string preferencesText = (request.Preferences != null && request.Preferences.Count > 0)
                ? string.Join(", ", request.Preferences)
                : "Fără preferințe speciale";

            Console.WriteLine("\n==================================================");
            Console.WriteLine($"[1/2] CERERE PRIMITĂ [{DateTime.Now:HH:mm:ss}] PENTRU USER: {userId}");
            Console.WriteLine($" - Buget:            {(request.Budget.HasValue ? $"{request.Budget.Value:F2} MDL" : "Fără limită")}");
            Console.WriteLine($" - Alergii:          {allergiesText}");
            Console.WriteLine($" - Preferințe:       {preferencesText}");
            Console.WriteLine($" - Include Băutură:  {request.WantsDrink}");
            Console.WriteLine($" - Include Desert:   {request.WantsDessert}"); Console.WriteLine("=================================================="); MenuRepository repo = new MenuRepository(dbConnectionString); List<MenuItem> meniuComplet = await repo.GetMenuItemsAsync(); if (meniuComplet.Count == 0) { Console.WriteLine("[EROARE]: Nu s-au găsit preparate în baza de date."); return Results.BadRequest(new { error = "Nu s-au găsit preparate în baza de date." }); }                  // ⚡ Pre-filter allergens in C# before calling AI
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      List<MenuItem> safeMenu = meniuComplet;                 if (request.Allergies != null && request.Allergies.Count > 0)                 {                     safeMenu = meniuComplet.Where((MenuItem item) =>                     {                         string itemAllergens = item.Allergens?.ToLower() ?? "";                         return !request.Allergies.Any((string userAllergy) =>                             itemAllergens.Contains(userAllergy.ToLower().Trim()));                     }).ToList();                 }                  // ⚡ Strip heavy fields (images/descriptions) to minimize AI token usage
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              IEnumerable<object> lightweightMenu = safeMenu.Select((MenuItem m) => new                 {                     id = m.Id,                     name = m.Name,                     category = m.Category,                     price = m.Price,                     allergens = m.Allergens                 });                  string menuJson = JsonSerializer.Serialize(lightweightMenu);
                string prompt = $$"""
Analizează meniul disponibil și recomandă o combinație optimă.

CONSTRÂNGERI UTILIZATOR:
- Buget maxim: {{(request.Budget.HasValue ? $"{request.Budget.Value:F2} MDL" : "Fără limită")}}
- Include băutură: {{(request.WantsDrink ? "DA" : "NU")}}
- Include desert: {{(request.WantsDessert ? "DA" : "NU")}}
- Preferințe suplimentare: {{preferencesText}}
- Alergii de evitat: {{allergiesText}}

REGULI STRICTE:
1. EXCLUDE complet preparatele cu alergenii menționați.
2. Dacă "Include băutură" este DA, cel puțin un obiect trebuie să fie din categoria Băuturi / Drinks.
3. Dacă "Include desert" este DA, cel puțin un obiect trebuie să fie din categoria Desert / Dessert.
4. Costul total NU trebuie să depășească bugetul maxim.

MENIU COMPLET DISPONIBIL (JSON):
{{menuJson}}

FORMAT RĂSPUNS:
Răspunde EXCLUSIV în format JSON valid conform acestei structuri:
{
  "selected_items": [
    {
      "id": 1,
      "name": "Nume preparat",
      "price": 100.00,
      "category": "Categorie",
      "reason": "De ce a fost ales preparatul"
    }
  ],
  "total_cost": 100.00,
  "remaining_budget": 200.00,
  "reasoning": "Explicație generală a alegerii"
}
""";

                Console.WriteLine("\n[2/2] SE TRIMITE PROMPT-UL CĂTRE AI...");

                List<ChatMessage> messages = new List<ChatMessage>
                {
                    new SystemChatMessage("Ești un asistent culinar rapid. Răspunde STRICT în format JSON valid."),
                    new UserChatMessage(prompt)
                };

    // Reuses singleton client connection
    ChatCompletion completion = await client.CompleteChatAsync(messages);

    string rawText = completion.Content[0].Text;
    Console.WriteLine($"[RAW AI TEXT]:\n{rawText}\n");

                string cleanJson = CleanJsonOutput(rawText);

    JsonSerializerOptions jsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    };

    AIRecommendationResult? result = JsonSerializer.Deserialize<AIRecommendationResult>(cleanJson, jsonOptions);

                if (result == null)
                {
                    Console.WriteLine("[EROARE]: Deserializarea JSON a returnat null.");
                    return Results.Problem("Eroare la procesarea răspunsului de la AI.");
                }

// Attach exact image_url from PostgreSQL by matching item ID
IEnumerable<object> enrichedItems = result.SelectedItems.Select<RecommendedItem, object>((RecommendedItem rec) =>
{
    MenuItem? dbItem = meniuComplet.FirstOrDefault((MenuItem m) => m.Id == rec.Id);
    return new
    {
        id = rec.Id,
        name = rec.Name,
        price = rec.Price,
        category = rec.Category,
        reason = rec.Reason,
        image_url = dbItem?.ImageUrl ?? ""
    };
});

object responsePayload = new
{
    selected_items = enrichedItems,
    total_cost = result.TotalCost,
    remaining_budget = result.RemainingBudget,
    reasoning = result.Reasoning
};

Console.WriteLine($"[SUCCES]: Generat {result.SelectedItems.Count} preparate, Cost: {result.TotalCost:F2} MDL");
return Results.Ok(responsePayload);
            }
            catch (Exception ex)
            {
    Console.WriteLine($"[EXCEPȚIE SERVICIU]: {ex}");
    return Results.Problem($"Eroare server: {ex.Message}");
}
        });

Console.WriteLine("Serverul backend rulează pe http://localhost:5000...");
app.Run("http://0.0.0.0:5000");
    }

    private static string CleanJsonOutput(string rawText)
{
    string text = rawText.Trim();
    if (text.StartsWith("```json")) text = text[7..];
    else if (text.StartsWith("```")) text = text[3..];
    if (text.EndsWith("```")) text = text[..^3];
    return text.Trim();
}
}

// Request Payload DTO received from website (includes optional user_id)
public record UserRecommendationRequest(
    [property: JsonPropertyName("user_id")] string? UserId,
    [property: JsonPropertyName("budget")] decimal? Budget,
    [property: JsonPropertyName("allergies")] List<string>? Allergies,
    [property: JsonPropertyName("wants_drink")] bool WantsDrink,
    [property: JsonPropertyName("wants_dessert")] bool WantsDessert,
    [property: JsonPropertyName("preferences")] List<string>? Preferences
);