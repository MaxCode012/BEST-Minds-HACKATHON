using Microsoft.AspNetCore.Builder;
using OpenAI;
using OpenAI.Chat;
using System;
using System.ClientModel;
using System.Collections.Generic;
using System.Numerics;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        // 1. Secrets & Connection Configuration
        string apiKey = builder.Configuration["OpenRouterApiKey"]
            ?? Environment.GetEnvironmentVariable("OPENROUTER_API_KEY")
            ?? throw new InvalidOperationException("Set OpenRouterApiKey or OPENROUTER_API_KEY before running.");
        string modelName = "inclusionai/ling-3.1-flash"; // Or "google/gemini-flash-1.5"

        string dbConnectionString = builder.Configuration.GetConnectionString("PostgreSQL")
            ?? "Host=localhost;Port=5432;Database=Hackaton;Username=postgres;Password=12345%$#@!";

        string modelName = "inclusionai/ling-3.1-flash";

        // 2. Fetch Complete Unfiltered Menu via External MenuRepository
        Console.WriteLine("Citesc meniul complet din baza de date PostgreSQL...");
        MenuRepository repo = new MenuRepository(dbConnectionString);
        List<MenuItem> meniuComplet = await repo.GetMenuItemsAsync();

        Console.WriteLine($"Au fost încărcate toate cele {meniuComplet.Count} preparate.");          // 3. Prepare User Constraints & Full Menu JSON
        List<string> userPreferences = new List<string> { "Picant", "Fără Gluten" };         
        decimal? userBudget = 300.00m;          
        string menuJson = JsonSerializer.Serialize(meniuComplet);          // 4. Construct AI Prompt
        string prompt = $$"""
        Analizează meniul complet disponibil și recomandă o combinație optimă.

        CONSTRÂNGERI UTILIZATOR:
        -Preferințe: {{ string.Join(", ", userPreferences)}}
        -Buget maxim: {{ (userBudget.HasValue ? $"{userBudget.Value:F2} MDL" : "Fără limită")}}

        MENIU COMPLET DISPONIBIL(JSON):
        {{ menuJson}}

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

        // 5. Send Prompt to OpenRouter API
        OpenAIClientOptions options = new OpenAIClientOptions
        {
            Endpoint = new Uri("https://openrouter.ai/api/v1")
        };

        ChatClient client = new ChatClient(modelName, new ApiKeyCredential(apiKey), options);

        List<ChatMessage> messages = new List<ChatMessage>
        {
            new SystemChatMessage("Ești un asistent culinar. Răspunde STRICT în format JSON valid."),
            new UserChatMessage(prompt)
        };

        try
        {
            Console.WriteLine("Trimiterea meniului complet către AI...");
            ChatCompletion completion = await client.CompleteChatAsync(messages);

            string cleanJson = CleanJsonOutput(completion.Content[0].Text);

            JsonSerializerOptions jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            AIRecommendationResult? result = JsonSerializer.Deserialize<AIRecommendationResult>(cleanJson, jsonOptions);

            if (result != null)
            {
                Console.WriteLine("\n=== RECOMANDARE AI ===");
                Console.WriteLine($"Cost Total: {result.TotalCost:F2} MDL");
                Console.WriteLine($"Motiv: {result.Reasoning}\n");

                foreach (RecommendedItem item in result.SelectedItems)
                {
                    Console.WriteLine($" - [{item.Category}] {item.Name} ({item.Price:F2} MDL)");
                    Console.WriteLine($"   Motiv: {item.Reason}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Eroare]: {ex.Message}");
        }
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