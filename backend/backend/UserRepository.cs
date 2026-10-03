using Npgsql;
using System.Collections.Generic;
using System.Threading.Tasks;

public record UserProfileDto(
    string Id,
    string Name,
    List<string> Allergies,
    List<string> Preferences
);

public class UserRepository
{
    private readonly string _connectionString;

    public UserRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<UserProfileDto?> GetUserByQrCodeAsync(string qrCode)
    {
        using NpgsqlConnection connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        string sql = @"
            SELECT id, name, allergies, preferences 
            FROM users 
            WHERE id = @qrCode;";

        using NpgsqlCommand command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@qrCode", qrCode);

        using NpgsqlDataReader reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            string id = reader.GetString(0);
            string name = reader.GetString(1);

            // Map PostgreSQL TEXT[] array columns to C# List<string>
            string[] allergiesArray = reader.IsDBNull(2) ? new string[0] : (string[])reader.GetValue(2);
            string[] preferencesArray = reader.IsDBNull(3) ? new string[0] : (string[])reader.GetValue(3);

            return new UserProfileDto(
                id,
                name,
                new List<string>(allergiesArray),
                new List<string>(preferencesArray)
            );
        }

        return null;
    }
}