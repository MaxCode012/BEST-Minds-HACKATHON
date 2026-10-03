namespace ManagementRest.Api.DTOs;

public class RecommendationResponse
{
    public int OrderId { get; set; }
    public DateTimeOffset RequestedAt { get; set; }
    public List<RecommendedMenuItemDto> SelectedItems { get; set; } = [];
    public decimal TotalCost { get; set; }
    public decimal RemainingBudget { get; set; }
    public string Reasoning { get; set; } = string.Empty;
}

public class RecommendedMenuItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
