using System.Collections.Generic;
using System.Text.Json.Serialization;

public record NutritionalValue(
    [property: JsonPropertyName("calories")] int Calories,
    [property: JsonPropertyName("protein_g")] int ProteinGrams,
    [property: JsonPropertyName("carbs_g")] int CarbsGrams,
    [property: JsonPropertyName("fat_g")] int FatGrams
);

public record MenuItem(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("weight_grams")] int WeightGrams,
    [property: JsonPropertyName("image_url")] string ImageUrl,
    [property: JsonPropertyName("price")] decimal Price,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("allergens")] string Allergens,
    [property: JsonPropertyName("nutritional_value")] NutritionalValue NutritionalValue
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

public record SaveUserAllergiesRequest(
    [property: JsonPropertyName("userKey")] string UserKey,
    [property: JsonPropertyName("allergens")] List<string>? Allergens,
    [property: JsonPropertyName("preferences")] string? Preferences
);

public record UserRecommendationRequest(
    [property: JsonPropertyName("user_id")] string? UserId,
    [property: JsonPropertyName("budget")] decimal? Budget,
    [property: JsonPropertyName("allergies")] List<string>? Allergies,
    [property: JsonPropertyName("wants_drink")] bool WantsDrink,
    [property: JsonPropertyName("wants_dessert")] bool WantsDessert,
    [property: JsonPropertyName("preferences")] List<string>? Preferences
);