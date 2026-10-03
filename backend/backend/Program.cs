using System;
using System.Collections.Generic;
using System.ClientModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using OpenAI;
using OpenAI.Chat;

class Program
{
    static async Task Main(string[] args)
    {
        // 1. OpenRouter Configuration
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        string apiKey = builder.Configuration["OpenRouterApiKey"]
            ?? Environment.GetEnvironmentVariable("OPENROUTER_API_KEY")
            ?? throw new InvalidOperationException("Set OpenRouterApiKey or OPENROUTER_API_KEY before running.");
        string modelName = "meta-llama/llama-3.3-70b-instruct"; // Or "google/gemini-flash-1.5"

        // 2. Full Menu with Romanian Items & Market Prices in MDL
        List<MenuItem> meniuComplet = new List<MenuItem>
        {
            new MenuItem(1, "Rulouri crocante de primăvară", 85.00m, "Gustări", "Rulouri crocante din legume servite cu sos dulce-picant"),
            new MenuItem(2, "Aripioare picante Buffalo", 130.00m, "Gustări", "Aripioare crocante de pui glazurate în sos iute Buffalo"),
            new MenuItem(3, "Ciuperci cu usturoi", 95.00m, "Gustări", "Ciuperci de pădure trase la tigaie cu unt și usturoi"),
            new MenuItem(4, "Pui picant cu busuioc", 165.00m, "Fel Principal", "Carne de pui trasă la tigaie cu ardei iute, busuioc proaspăt și orez iasomie"),
            new MenuItem(5, "Pad Thai cu legume", 145.00m, "Fel Principal", "Tăiței de orez trași la tigaie cu tofu, germeni de fasole și alune"),
            new MenuItem(6, "Somon la grătar", 280.00m, "Fel Principal", "File proaspăt de somon servit cu sparanghel tras în unt"),
            new MenuItem(7, "Burger de vită cu cartofi", 175.00m, "Fel Principal", "Pârjoală din carne de vită Angus, brânză cheddar și cartofi pai"),
            new MenuItem(8, "Cartofi pai", 55.00m, "Garnituri", "Cartofi prăjiți aurii și crocanți cu sare de mare"),
            new MenuItem(9, "Orez Iasomie", 45.00m, "Garnituri", "Orez iasomie aromat gătit la abur"),
            new MenuItem(10, "Limonadă de casă", 60.00m, "Băuturi", "Suc proaspăt de lămâie cu mentă și miere (500ml)"),
            new MenuItem(11, "Matcha Latte cu gheață", 65.00m, "Băuturi", "Ceai verde matcha japonez cu lapte și gheață"),
            new MenuItem(12, "Apă minerală", 35.00m, "Băuturi", "Apă minerală carbogazoasă rece (500ml)"),
            new MenuItem(13, "Lava Cake de ciocolată", 95.00m, "Desert", "Prăjitură caldă cu ciocolată lichidă la interior și cupă de înghețată"),
            new MenuItem(14, "Orez lipicios cu mango", 90.00m, "Desert", "Orez dulce cu lapte de cocos și felii de mango proaspăt")
        };

        // 3. User Input Preferences & Constraints
        List<string> userPreferences = new List<string> { "Picant" };
        decimal? userBudget = 250.00m; // Budget in MDL (Optional)
        bool? wantsDrink = true;       // Optional drink requirement

        // 4. Pre-filter menu based on budget before sending to AI
        List<MenuItem> filteredMenu = userBudget.HasValue
            ? meniuComplet.FindAll(m => m.Price <= userBudget.Value)
            : meniuComplet;

        string menuJson = JsonSerializer.Serialize(filteredMenu);

        // 5. Construct AI Prompt using $$""" to allow single braces { } for JSON
        string prompt = $$"""
        Analizează meniul disponibil și selectează cea mai bună combinație de preparate.

        CONSTRÂNGERI UTILIZATOR:
        - Preferințe: {{string.Join(", ", userPreferences)}}
        - Buget maxim: {{(userBudget.HasValue ? $"{userBudget.Value:F2} MDL" : "Fără limită")}}
        - Include băutură: {{(wantsDrink.HasValue ? (wantsDrink.Value ? "DA (Include o băutură din meniu)" : "NU") : "Opțional")}}

        MENIU DISPONIBIL:
        {{menuJson}}

        FORMAT RĂSPUNS:
        Răspunde EXCLUSIV în format JSON valid conform acestei structuri:
        {
          "selected_items": [
            {
              "id": 4,
              "name": "Pui picant cu busuioc",
              "price": 165.00,
              "category": "Fel Principal",
              "reason": "Potrivire perfectă pentru preferința de mâncare picantă."
            }
          ],
          "total_cost": 225.00,
          "remaining_budget": 25.00,
          "reasoning": "S-a ales un fel principal picant și o limonadă, încadrându-se în buget."
        }
        """;

        // 6. Execute OpenRouter API call
        OpenAIClientOptions options = new OpenAIClientOptions
        {
            Endpoint = new Uri("https://openrouter.ai/api/v1")
        };

        ChatClient client = new ChatClient(modelName, new ApiKeyCredential(apiKey), options);

        List<ChatMessage> messages = new List<ChatMessage>
        {
            new SystemChatMessage("Ești un asistent culinar. Răspunde STRICT în format JSON valid, fără text sau marcaje adiacente."),
            new UserChatMessage(prompt)
        };

        Console.WriteLine($"Trimiterea meniului către AI ({modelName})...");

        try
        {
            ChatCompletion completion = await client.CompleteChatAsync(messages);
            string rawJsonResponse = completion.Content[0].Text;

            // Strip Markdown code fences if the model wraps output in ```json
            string cleanJson = CleanJsonOutput(rawJsonResponse);

            // 7. Deserialize AI Response into C# Objects and Save Recommendations
            JsonSerializerOptions jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            AIRecommendationResult? result = JsonSerializer.Deserialize<AIRecommendationResult>(cleanJson, jsonOptions);

            if (result != null)
            {
                Console.WriteLine("\n=== RECOMANDARE PRIMITĂ ȘI PARSATĂ DE AI ===");
                Console.WriteLine($"Cost Total: {result.TotalCost:F2} MDL");
                Console.WriteLine($"Buget Rămas: {(result.RemainingBudget.HasValue ? $"{result.RemainingBudget.Value:F2} MDL" : "N/A")}");
                Console.WriteLine($"Motiv: {result.Reasoning}\n");

                //List<SavedRecommendation> savedDatabaseRecords = new List<SavedRecommendation>();

                foreach (RecommendedItem item in result.SelectedItems)
                {
                    Console.WriteLine($" - [{item.Category}] {item.Name} ({item.Price:F2} MDL)");
                    Console.WriteLine($"   Motiv: {item.Reason}");

                    // Create strongly-typed entity ready to be saved into SQLite / Database / Session
                    /*SavedRecommendation recordToSave = new SavedRecommendation(
                        item.Id,
                        item.Name,
                        item.Price,
                        item.Reason,
                        DateTime.Now
                    );*/

                    //savedDatabaseRecords.Add(recordToSave);
                }

                //Console.WriteLine($"\nSucces! {savedDatabaseRecords.Count} recomandări au fost salvate în lista de obiecte C#.");
            }
        }
        catch (ClientResultException ex) when (ex.Status == 429)
        {
            Console.WriteLine("\n[Eroare 429 Rate Limit]: Modelul gratuit este solicitat. Așteptați câteva secunde și încercați din nou.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\n[Excepție]: {ex.Message}");
        }
    }

    private static string CleanJsonOutput(string rawText)
    {
        string text = rawText.Trim();
        if (text.StartsWith("```json"))
        {
            text = text.Substring(7);
        }
        else if (text.StartsWith("```"))
        {
            text = text.Substring(3);
        }

        if (text.EndsWith("```"))
        {
            text = text.Substring(0, text.Length - 3);
        }

        return text.Trim();
    }
}

// --- DATA TRANSFER OBJECTS (DTOs) ---

public record MenuItem(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("price")] decimal Price,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("description")] string Description
);

public record RecommendedItem(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("price")] decimal Price,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("reason")] string Reason
);

public record AIRecommendationResult(
    [property: JsonPropertyName("selected_items")] List<RecommendedItem> SelectedItems,
    [property: JsonPropertyName("total_cost")] decimal TotalCost,
    [property: JsonPropertyName("remaining_budget")] decimal? RemainingBudget,
    [property: JsonPropertyName("reasoning")] string Reasoning
);

public record SavedRecommendation(
    int MenuItemId,
    string ItemName,
    decimal Price,
    string RecommendationReason,
    DateTime SavedAt
);