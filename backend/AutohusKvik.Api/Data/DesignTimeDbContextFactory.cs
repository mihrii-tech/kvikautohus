using AutohusKvik.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AutohusKvik.Api;

/// <summary>
/// Bruges kun af EF Core tools (dotnet ef migrations add) uden live database-forbindelse.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        // Placeholder connection string til design-time – kræver IKKE en live database
        optionsBuilder.UseMySql(
            "Server=localhost;Database=autohusskvik_dev;User=root;Password=;CharSet=utf8mb4;",
            new MySqlServerVersion(new Version(8, 0, 0)));

        return new AppDbContext(optionsBuilder.Options);
    }
}
