using System.ClientModel;
using System.Text.Json.Serialization;
using System.Text.Json;
using ManagementRest.Api.DTOs;
using ManagementRest.Api.Entities;
using OpenAI;
using OpenAI.Chat;

namespace ManagementRest.Api.Services;

public class RecommendationService
{
    private readonly ChatClient _chatClient;
    private readonly bool _apiKeyError;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };
    private readonly List<MenuItem> _menu =
    [
        new() { Id = 1, Name = "Crispy spring rolls", Price = 85m, Category = "Starter", Description = "Crispy vegetable rolls with sweet chili sauce" },
        new() { Id = 2, Name = "Buffalo chicken wings", Price = 130m, Category = "Starter", Description = "Crispy chicken wings in spicy Buffalo sauce" },
        new() { Id = 3, Name = "Garlic mushrooms", Price = 95m, Category = "Starter", Description = "Pan-fried mushrooms with butter and garlic" },
        new() { Id = 4, Name = "Spicy basil chicken", Price = 165m, Category = "Main", Description = "Chicken with chili, fresh basil and jasmine rice" },
        new() { Id = 5, Name = "Vegetable Pad Thai", Price = 145m, Category = "Main", Description = "Rice noodles with tofu, bean sprouts and peanuts" },
        new() { Id = 6, Name = "Grilled salmon", Price = 280m, Category = "Main", Description = "Fresh salmon with buttered asparagus" },
        new() { Id = 7, Name = "Beef burger with fries", Price = 175m, Category = "Main", Description = "Angus beef burger with cheddar and fries" },
        new() { Id = 8, Name = "French fries", Price = 55m, Category = "Side", Description = "Golden crispy fries with sea salt" },
        new() { Id = 9, Name = "Jasmine rice", Price = 45m, Category = "Side", Description = "Steamed fragrant jasmine rice" },
        new() { Id = 10, Name = "Homemade lemonade", Price = 60m, Category = "Drink", Description = "Fresh lemon juice with mint and honey" },
        new() { Id = 11, Name = "Iced matcha latte", Price = 65m, Category = "Drink", Description = "Japanese matcha with milk and ice" },
        new() { Id = 12, Name = "Mineral water", Price = 35m, Category = "Drink", Description = "Chilled sparkling mineral water" },
        new() { Id = 13, Name = "Chocolate lava cake", Price = 95m, Category = "Dessert", Description = "Warm chocolate cake with a molten center" },
        new() { Id = 14, Name = "Mango sticky rice", Price = 90m, Category = "Dessert", Description = "Sweet coconut rice with fresh mango" }
    ];

    public RecommendationService(IConfiguration configuration)
    {
        var apiKey = configuration["OpenRouter:ApiKey"]
            ?? configuration["OpenRouterApiKey"]
            ?? Environment.GetEnvironmentVariable("OPENROUTER_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _apiKeyError = true;
            _chatClient = null!;
            return;
        }

        var model = configuration["OpenRouter:Model"] ?? "meta-llama/llama-3.3-70b-instruct";
        var options = new OpenAIClientOptions { Endpoint = new Uri("https://openrouter.ai/api/v1") };
        _chatClient = new ChatClient(model, new ApiKeyCredential(apiKey), options);
    }

    public async Task<RecommendationResponse> RecommendAsync(RecommendationRequest request, CancellationToken cancellationToken)
    {
        if (_apiKeyError)
        {
            throw new InvalidOperationException("OpenRouter API key is missing. Set OpenRouterApiKey in User Secrets for the ManagementRest.Api project.");
        }

        var requestedAt = request.RequestedAt ?? DateTimeOffset.UtcNow;
        var availableMenu = _menu
            .Where(item => item.Price <= request.Budget && (request.IncludeDrink || item.Category != "Drink"))
            .ToList();

        if (availableMenu.Count == 0)
        {
            return new RecommendationResponse
            {
                OrderId = request.OrderId,
                RequestedAt = requestedAt,
                RemainingBudget = request.Budget,
                Reasoning = "No menu items fit the supplied budget and drink preference."
            };
        }

        var menuJson = JsonSerializer.Serialize(availableMenu);
        var preferences = request.Preferences.Count == 0 ? "No specific preferences" : string.Join(", ", request.Preferences);
        var prompt = $$"""
            Recommend a meal using only the menu items below. Use the budget as a hard limit and honor the drink preference.
            Preferences: {{preferences}}
            Budget: {{request.Budget}} MDL
            Include a drink: {{request.IncludeDrink}}
            Requested time: {{requestedAt:O}}
            Menu: {{menuJson}}
            Return only valid JSON matching this schema:
            {"selected_items":[{"id":1,"reason":"Why this item fits"}],"reasoning":"Brief explanation"}
            """;

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage("You are a food recommendation assistant. Return only valid JSON."),
            new UserChatMessage(prompt)
        };
        var completion = await _chatClient.CompleteChatAsync(messages, cancellationToken: cancellationToken);
        var rawText = completion.Value.Content.FirstOrDefault()?.Text;
        if (string.IsNullOrWhiteSpace(rawText))
        {
            throw new InvalidOperationException("The AI returned an empty response.");
        }

        var aiResult = JsonSerializer.Deserialize<AiRecommendationResult>(CleanJson(rawText), _jsonOptions)
            ?? throw new InvalidOperationException("The AI response could not be parsed.");

        var selectedItems = aiResult.SelectedItems
            .Select(recommendation =>
            {
                var menuItem = availableMenu.FirstOrDefault(item => item.Id == recommendation.Id);
                return menuItem == null ? null : new RecommendedMenuItemDto
                {
                    Id = menuItem.Id,
                    Name = menuItem.Name,
                    Price = menuItem.Price,
                    Category = menuItem.Category,
                    Reason = recommendation.Reason ?? string.Empty
                };
            })
            .Where(item => item != null)
            .Cast<RecommendedMenuItemDto>()
            .DistinctBy(item => item.Id)
            .ToList();

        while (selectedItems.Sum(item => item.Price) > request.Budget && selectedItems.Count > 0)
        {
            selectedItems.RemoveAt(selectedItems.Count - 1);
        }

        var total = selectedItems.Sum(item => item.Price);
        return new RecommendationResponse
        {
            OrderId = request.OrderId,
            RequestedAt = requestedAt,
            SelectedItems = selectedItems,
            TotalCost = total,
            RemainingBudget = request.Budget - total,
            Reasoning = aiResult.Reasoning ?? "Recommendations selected from the available menu."
        };
    }

    private static string CleanJson(string text)
    {
        text = text.Trim();
        if (text.StartsWith("```", StringComparison.Ordinal))
        {
            var newline = text.IndexOf('\n');
            text = newline >= 0 ? text[(newline + 1)..] : text[3..];
            if (text.EndsWith("```", StringComparison.Ordinal))
            {
                text = text[..^3];
            }
        }
        return text.Trim();
    }

    private sealed class AiRecommendationResult
    {
        [JsonPropertyName("selected_items")]
        public List<AiRecommendedItem> SelectedItems { get; set; } = [];
        public string? Reasoning { get; set; }
    }

    private sealed class AiRecommendedItem
    {
        public int Id { get; set; }
        public string? Reason { get; set; }
    }
}
