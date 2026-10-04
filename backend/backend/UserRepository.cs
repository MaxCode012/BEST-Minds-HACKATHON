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
    public async Task SaveUserProfileAsync(string userKey, List<string> allergens, string preferences)
    {
        using NpgsqlConnection connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        // Format "MAXIM_SEREMET" into "MAXIM SEREMET" for display
        string formattedName = userKey.Replace("_", " ");

        string[] allergiesArray = allergens != null ? allergens.ToArray() : new string[0];

        // Convert single preferences text into an array for the PostgreSQL TEXT[] column
        string[] preferencesArray = string.IsNullOrWhiteSpace(preferences)
            ? new string[0]
            : new string[] { preferences.Trim() };

        string sql = @"
        INSERT INTO users (id, name, allergies, preferences)
        VALUES (@id, @name, @allergies, @preferences)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            allergies = EXCLUDED.allergies,
            preferences = EXCLUDED.preferences;";

        using NpgsqlCommand command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@id", userKey);
        command.Parameters.AddWithValue("@name", formattedName);
        command.Parameters.AddWithValue("@allergies", allergiesArray);
        command.Parameters.AddWithValue("@preferences", preferencesArray);

        await command.ExecuteNonQueryAsync();
    }
}