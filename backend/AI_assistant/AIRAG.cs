using System;
using System.ClientModel;
using System.Collections.Generic;
using System.Threading.Tasks;
using OpenAI;
using OpenAI.Chat;

public class OpenRouterSdkService
{
    private readonly ChatClient _chatClient;

    public OpenRouterSdkService(string apiKey, string modelName = "meta-llama/llama-3.3-70b-instruct")
    {
        OpenAIClientOptions options = new OpenAIClientOptions
        {
            Endpoint = new Uri("https://openrouter.ai/api/v1")
        };

        _chatClient = new ChatClient(modelName, new ApiKeyCredential(apiKey), options);
    }

    public async Task<string> SendPromptAsync(string prompt)
    {
        List<ChatMessage> messages = new List<ChatMessage>
        {
            new SystemChatMessage("You are a helpful culinary assistant."),
            new UserChatMessage(prompt)
        };

        ChatCompletion completion = await _chatClient.CompleteChatAsync(messages);
        return completion.Content[0].Text;
    }
}

// --- EXAMPLE USAGE ---
public class SdkProgram
{
    public static async Task Main()
    {
        string apiKey = Environment.GetEnvironmentVariable("OPENROUTER_API_KEY")
            ?? throw new InvalidOperationException("Set OPENROUTER_API_KEY before running.");
        OpenRouterSdkService sdkService = new OpenRouterSdkService(apiKey, "meta-llama/llama-3.3-70b-instruct");

        string responseText = await sdkService.SendPromptAsync("Give me 3 quick dinner ideas under 15 minutes.");

        Console.WriteLine("AI Response:");
        Console.WriteLine(responseText);
    }
}