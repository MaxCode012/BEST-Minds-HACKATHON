using System.Text.Json;
using ManagementRest.Api.DTOs;

namespace ManagementRest.Api.Services;

public class RecommendationResponseStore(IWebHostEnvironment environment)
{
    private readonly string _filePath = Path.Combine(environment.ContentRootPath, "Data", "recommendations.json");
    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

    public async Task<IReadOnlyList<RecommendationResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            return await ReadAllAsync(cancellationToken);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task AddAsync(RecommendationResponse response, CancellationToken cancellationToken)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var responses = await ReadAllAsync(cancellationToken);
            responses.Add(response);

            Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
            var temporaryPath = $"{_filePath}.{Guid.NewGuid():N}.tmp";
            try
            {
                await using (var stream = File.Create(temporaryPath))
                {
                    await JsonSerializer.SerializeAsync(stream, responses, _jsonOptions, cancellationToken);
                }

                File.Move(temporaryPath, _filePath, overwrite: true);
            }
            finally
            {
                if (File.Exists(temporaryPath))
                {
                    File.Delete(temporaryPath);
                }
            }
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task<List<RecommendationResponse>> ReadAllAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(_filePath))
        {
            return [];
        }

        await using var stream = File.OpenRead(_filePath);
        return await JsonSerializer.DeserializeAsync<List<RecommendationResponse>>(stream, _jsonOptions, cancellationToken) ?? [];
    }
}
