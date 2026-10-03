using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using OpenAI;
using OpenAI.Chat;
using System;
using System.ClientModel;
using System.Collections.Generic;
using System.Numerics;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

class Program
{
    static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        // 1. Enable CORS so your frontend website can call this endpoint
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowWebsite", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        WebApplication app = builder.Build();
        app.UseCors("AllowWebsite");

        // 2. Load Configuration & Secrets
        string apiKey = builder.Configuration["OpenRouterApiKey"]
            ?? Environment.GetEnvironmentVariable("OPENROUTER_API_KEY")
            ?? throw new InvalidOperationException("Set OpenRouterApiKey or OPENROUTER_API_KEY before running.");

        string dbConnectionString = builder.Configuration.GetConnectionString("PostgreSQL")
<<<<<<< HEAD
            ?? "Host=localhost;Port=5432;Database=Hackaton;Username=postgres;Password=12345%$#@!"; string modelName = "inclusionai/ling-3.1-flash";         
        // 3. Define POST Endpoint for Website Requests
        app.MapPost("/api/recommendations", async (UserRecommendationRequest request) =>{            
            try             
            {                 // Fetch menu from PostgreSQL
                MenuRepository repo = new MenuRepository(dbConnectionString);                 
                List<MenuItem> meniuComplet = await repo.GetMenuItemsAsync();                  
                if (meniuComplet.Count == 0) 
                {                     
                    return Results.BadRequest(new { error = "Nu s-au găsit preparate în baza de date." });
                }                  
                string menuJson = JsonSerializer.Serialize(meniuComplet);                  
                string allergiesText = (request.Allergies != null && request.Allergies.Count > 0) ? string.Join(", ", request.Allergies) : "Fără alergii declarate";                  
                string preferencesText = (request.Preferences != null && request.Preferences.Count > 0) ? string.Join(", ", request.Preferences): "Fără preferințe speciale"; 
                // Construct AI Prompt with Budget, Allergies, Drink & Dessert rules
        string prompt = $$"""
        Analizează meniul complet disponibil și recomandă o combinație optimă.

                CONSTRÂNGERI UTILIZATOR:
                -Buget maxim: {{ (request.Budget.HasValue ? $"{request.Budget.Value:F2} MDL" : "Fără limită")}}
        -Alergii / Intoleranțe: {{ allergiesText}}
        -Include băutură: {{ (request.WantsDrink ? "DA (Trebuie să includă cel puțin o băutură)" : "NU")}}
        -Include desert: {{ (request.WantsDessert ? "DA (Trebuie să includă cel puțin un desert)" : "NU")}}
        -Preferințe suplimentare: {{ preferencesText}}

        REGULI STRICTE:
                1.EXCLUDE complet preparatele care conțin alergiile menționate în câmpul de alergii al meniului.
                2.Dacă "Include băutură" este DA, cel puțin un obiect din recomandare trebuie să fie din categoria Băuturi / Drinks.
                3.Dacă "Include desert" este DA, cel puțin un obiect din recomandare trebuie să fie din categoria Desert / Dessert.
                4.Costul total NU trebuie să depășească bugetul maxim.

                MENIU COMPLET DISPONIBIL(JSON):
                {{ menuJson}}
=======
            ?? "Host=localhost;Port=5432;Database=Hackaton;Username=postgres;Password=12345%$#@!"; string modelName = "inclusionai/ling-3.1-flash";
        // 3. Define POST Endpoint for Website Requests

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

        app.MapPost("/api/recommendations", async (UserRecommendationRequest request) =>
        {
            try
            {
                string allergiesText = (request.Allergies != null && request.Allergies.Count > 0)
                    ? string.Join(", ", request.Allergies)
                    : "Fără alergii declarate";

                string preferencesText = (request.Preferences != null && request.Preferences.Count > 0)
                    ? string.Join(", ", request.Preferences)
                    : "Fără preferințe speciale";

                Console.WriteLine("\n==================================================");
                Console.WriteLine($"[1/2] CERERE PRIMITĂ DE LA SITE [{DateTime.Now:HH:mm:ss}]");
                Console.WriteLine($" - Buget:            {(request.Budget.HasValue ? $"{request.Budget.Value:F2} MDL" : "Fără limită")}");
                Console.WriteLine($" - Alergii:          {allergiesText}");
                Console.WriteLine($" - Preferințe:       {preferencesText}");
                Console.WriteLine($" - Include Băutură:  {request.WantsDrink}");
                Console.WriteLine($" - Include Desert:   {request.WantsDessert}");
                Console.WriteLine("==================================================");

                MenuRepository repo = new MenuRepository(dbConnectionString);
                List<MenuItem> meniuComplet = await repo.GetMenuItemsAsync();

                if (meniuComplet.Count == 0)
                {
                    Console.WriteLine("[EROARE]: Nu s-au găsit preparate în baza de date.");
                    return Results.BadRequest(new { error = "Nu s-au găsit preparate în baza de date." });
                }

                string menuJson = JsonSerializer.Serialize(meniuComplet);

                string prompt = $$"""
        Analizează meniul complet disponibil și recomandă o combinație optimă.

        CONSTRÂNGERI UTILIZATOR:
        - Buget maxim: {{(request.Budget.HasValue ? $"{request.Budget.Value:F2} MDL" : "Fără limită")}}
        - Include băutură: {{(request.WantsDrink ? "DA" : "NU")}}
        - Include desert: {{(request.WantsDessert ? "DA" : "NU")}}
        - Preferințe suplimentare: {{preferencesText}}
        - Alergii / Intoleranțe: {{allergiesText}}

        REGULI STRICTE:
        1. EXCLUDE complet preparatele care conțin alergiile menționate în câmpul de alergii al meniului.
        2. Dacă "Include băutură" este DA, cel puțin un obiect din recomandare trebuie să fie din categoria Băuturi / Drinks.
        3. Dacă "Include desert" este DA, cel puțin un obiect din recomandare trebuie să fie din categoria Desert / Dessert.
        4. Costul total NU trebuie să depășească bugetul maxim.

        MENIU COMPLET DISPONIBIL (JSON):
        {{menuJson}}
>>>>>>> Mark

        FORMAT RĂSPUNS:
                Răspunde EXCLUSIV în format JSON valid conform acestei structuri:
        {
<<<<<<< HEAD
            "selected_items": [
                    {
                "id": 1,
                      "name": "Nume preparat",
                      "price": 100.00,
                      "category": "Categorie",
                      "reason": "De ce a fost ales preparatul în raport cu alergiile și preferințele"
                    }
                  ],
                  "total_cost": 100.00,
                  "remaining_budget": 200.00,
                  "reasoning": "Explicație generală a alegerii"
                }
        """;

                // Call OpenRouter API
                OpenAIClientOptions options = new OpenAIClientOptions
                {
                    Endpoint = new Uri("https://openrouter.ai/api/v1")
                };
=======
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
>>>>>>> Mark

                OpenAIClientOptions options = new OpenAIClientOptions
                {
                    Endpoint = new Uri("https://openrouter.ai/api/v1")
                };

<<<<<<< HEAD
        List<ChatMessage> messages = new List<ChatMessage>
                {
                    new SystemChatMessage("Ești un asistent culinar. Răspunde STRICT în format JSON valid."),
                    new UserChatMessage(prompt)
                };

        ChatCompletion completion = await client.CompleteChatAsync(messages);
        string cleanJson = CleanJsonOutput(completion.Content[0].Text);

        JsonSerializerOptions jsonOptions = new JsonSerializerOptions
=======
                ChatClient client = new ChatClient(modelName, new ApiKeyCredential(apiKey), options);

                List<ChatMessage> messages = new List<ChatMessage>
>>>>>>> Mark
        {
            PropertyNameCaseInsensitive = true
        };

<<<<<<< HEAD
        AIRecommendationResult? result = JsonSerializer.Deserialize<AIRecommendationResult>(cleanJson, jsonOptions);

        if (result == null)
        {
            return Results.Problem("Eroare la procesarea răspunsului de la AI.");
        }

        // Return JSON back to the website
        return Results.Ok(result);
    }
            catch (Exception ex)
            {
                return Results.Problem($"Eroare server: {ex.Message}");
            }
        });

Console.WriteLine("Serverul backend rulează pe http://localhost:5000...");
app.Run("http://localhost:5000");
    }

    private static string CleanJsonOutput(string rawText)
{
    string text = rawText.Trim();
    if (text.StartsWith("```json")) text = text[7..];
    else if (text.StartsWith("```")) text = text[3..];
    if (text.EndsWith("```")) text = text[..^3];
    return text.Trim();
}
=======
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

                Console.WriteLine($"[SUCCES]: Generat {result.SelectedItems.Count} preparate, Cost: {result.TotalCost:F2} MDL");
                return Results.Ok(result);
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
>>>>>>> Mark
}

// Request Payload DTO received from website
public record UserRecommendationRequest(
    [property: JsonPropertyName("budget")] decimal? Budget,
    [property: JsonPropertyName("allergies")] List<string>? Allergies,
    [property: JsonPropertyName("wants_drink")] bool WantsDrink,
    [property: JsonPropertyName("wants_dessert")] bool WantsDessert,
    [property: JsonPropertyName("preferences")] List<string>? Preferences
);