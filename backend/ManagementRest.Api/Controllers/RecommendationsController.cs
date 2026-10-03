using System.ClientModel;
using ManagementRest.Api.DTOs;
using ManagementRest.Api.Services;
using Microsoft.AspNetCore.Mvc;
using OpenAI;

namespace ManagementRest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationsController(
    RecommendationService recommendationService,
    RecommendationResponseStore responseStore,
    ILogger<RecommendationsController> logger,
    IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<RecommendationResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<RecommendationResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await responseStore.GetAllAsync(cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType<RecommendationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<RecommendationResponse>> Create(
        [FromBody] RecommendationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await recommendationService.RecommendAsync(request, cancellationToken));
        }
        catch (ClientResultException exception) when (exception.Status == 429)
        {
            logger.LogWarning(exception, "The AI provider rate limit was reached.");
            return StatusCode(StatusCodes.Status429TooManyRequests,
                new ProblemDetails
                {
                    Title = "AI rate limit reached",
                    Detail = environment.IsDevelopment() ? exception.Message : "Wait briefly and try again."
                });
        }
        catch (Exception exception) when (exception is ClientResultException or InvalidOperationException)
        {
            logger.LogError(exception, "The AI recommendation request failed.");
            return StatusCode(StatusCodes.Status502BadGateway,
                new ProblemDetails
                {
                    Title = "Recommendation service failed",
                    Detail = environment.IsDevelopment()
                        ? exception.ToString()
                        : "The recommendation could not be generated. Check the API logs and try again."
                });
        }
    }
}
