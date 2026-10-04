using System.Text;
using System.Threading.RateLimiting;
using Microsoft.OpenApi.Models;
using AutohusKvik.Api.Data;
using AutohusKvik.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

// Indlæs .env fil hvis den findes
var envFiles = new[] { ".env", "../.env", "../../.env" };
foreach (var envFile in envFiles)
{
    if (File.Exists(envFile))
    {
        foreach (var line in File.ReadAllLines(envFile))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
            var parts = trimmed.Split('=', 2);
            if (parts.Length == 2)
            {
                var key = parts[0].Trim();
                var val = parts[1].Trim().Trim('"').Trim('\'');
                if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                {
                    Environment.SetEnvironmentVariable(key, val);
                }
            }
        }
        break;
    }
}

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Mangler DefaultConnection i konfigurationen.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(3)));

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Mangler Jwt:Secret i konfigurationen.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // Hent JWT fra cookie som alternativ til Authorization header
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (ctx.Request.Cookies.ContainsKey("access_token"))
                    ctx.Token = ctx.Request.Cookies["access_token"];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("owner", "staff"));
    options.AddPolicy("OwnerOnly", policy => policy.RequireRole("owner"));
});

// CORS (tilpas origin til produktion via miljøvariabel)
var allowedOrigins = builder.Configuration["AllowedOrigins"]?.Split(',')
    ?? new[] { "http://localhost:5173", "https://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    // Login: Max 5 forsøg pr. 5 minutter pr. IP
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0
            }));

    // Formularer: Max 10 indsendelser pr. minut pr. IP
    options.AddPolicy("forms", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Nummerpladeopslag: Høj grænse i development/localhost, 60 opslag/min i produktion
    options.AddPolicy("vehicle-lookup", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress;
        var isLocal = ip == null || System.Net.IPAddress.IsLoopback(ip);
        var permitLimit = (isLocal || builder.Environment.IsDevelopment()) ? 1000 : 60;

        return RateLimitPartition.GetFixedWindowLimiter(
            isLocal ? "localhost" : (ip?.ToString() ?? "unknown"),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            });
    });

    options.RejectionStatusCode = 429;
});

// Custom Services
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<ImageService>();
builder.Services.AddScoped<AuditLogService>();

// Synsbasen Vehicle Lookup
builder.Services.AddHttpClient<SynsbasenService>();

// Timezone (Denmark)
builder.Services.AddSingleton(TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen"));

// Static files (frontend build + uploads)
builder.Services.AddDirectoryBrowser();

var app = builder.Build();

// ─────────────────────────────────────────────────────
// Middleware pipeline
// ─────────────────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Statiske filer (frontend build i wwwroot + uploads)
app.UseStaticFiles();

app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SPA fallback: Alt der ikke er /api/* sendes til React's index.html
app.MapFallbackToFile("index.html");

// Auto-migrations ved opstart (kun i udvikling)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.Migrate();
        DbInitializer.Initialize(db);
        app.Logger.LogInformation("Database migrationer og seed gennemført.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Database migration fejlede. Kør 'dotnet ef database update' manuelt.");
    }
}

app.Run();
