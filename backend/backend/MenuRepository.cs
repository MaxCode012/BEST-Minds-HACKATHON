using System;
using System.Collections.Generic;
using System.Data;
using System.Text.Json;
using System.Threading.Tasks;
using Dapper;
using Npgsql;

public class MenuRepository
{
    private readonly string _connectionString;

    public MenuRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<List<MenuItem>> GetMenuItemsAsync()
    {
        using IDbConnection connection = new NpgsqlConnection(_connectionString);

        string sql = """
            SELECT 
                id AS Id, 
                name AS Name, 
                category AS Category, 
                weight AS WeightGrams, 
                image_url AS ImageUrl, 
                price AS Price, 
                description AS Description, 
                alergens AS Allergens, 
                nutritional_value::text AS NutritionalJson
            FROM menu_items;
        """;

        // Query directly into a strongly typed DTO to eliminate dynamic casting crashes
        IEnumerable<MenuItemDbRow> rawRows = await connection.QueryAsync<MenuItemDbRow>(sql);
        List<MenuItem> menuItems = new List<MenuItem>();
        JsonSerializerOptions jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        foreach (MenuItemDbRow row in rawRows)
        {
            string jsonStr = row.NutritionalJson ?? "{}";
            NutritionalValue nutrition = JsonSerializer.Deserialize<NutritionalValue>(jsonStr, jsonOptions)
                ?? new NutritionalValue(0, 0, 0, 0);

            MenuItem item = new MenuItem(
                row.Id,
                row.Name ?? string.Empty,
                row.Category ?? string.Empty,
                row.WeightGrams,
                row.ImageUrl ?? string.Empty,
                row.Price,
                row.Description ?? string.Empty,
                row.Allergens ?? string.Empty,
                nutrition
            );

            menuItems.Add(item);
        }

        return menuItems;
    }

    // Internal class for safe Dapper mapping
    private class MenuItemDbRow
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Category { get; set; }
        public int WeightGrams { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public string? Allergens { get; set; }
        public string? NutritionalJson { get; set; }
    }
}