using System.ComponentModel.DataAnnotations;

namespace ManagementRest.Api.DTOs;

public class RecommendationRequest
{
    [Range(1, int.MaxValue)]
    public int OrderId { get; set; }

    public List<string> Preferences { get; set; } = [];

    [Range(typeof(decimal), "0.01", "1000000")]
    public decimal Budget { get; set; }

    public bool IncludeDrink { get; set; }

    public DateTimeOffset? RequestedAt { get; set; }
}
