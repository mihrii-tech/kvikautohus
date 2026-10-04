using AutohusKvik.Api.Data;
using AutohusKvik.Api.Models;
using AutohusKvik.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AutohusKvik.Api.Controllers;

// ─── OFFENTLIG: Indhold og indstillinger ───
[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContentController(AppDbContext db) => _db = db;

    [HttpGet("settings/public")]
    public async Task<IActionResult> GetPublicSettings()
    {
        // Returnér kun settings der er sikre at eksponere offentligt
        var publicKeys = new[] {
            "company_name", "company_address", "company_phone", "company_emergency_phone",
            "company_email", "opening_hours", "social_facebook", "social_instagram",
            "show_testimonials", "google_rating_text", "show_sold_cars",
            "seo_title_suffix", "seo_default_description",
            "ga4_measurement_id", "gtm_container_id",
            "financing_interest_rate", "financing_establishment_fee",
            "financing_monthly_fee", "financing_disclaimer",
            "warranty_partner_name", "warranty_partner_url"
        };

        var settings = await _db.Settings
            .Where(s => publicKeys.Contains(s.Key))
            .ToDictionaryAsync(s => s.Key, s => s.Value);

        return Ok(settings);
    }

    [HttpGet("testimonials")]
    public async Task<IActionResult> GetTestimonials()
    {
        var items = await _db.Testimonials
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("sections/{key}")]
    public async Task<IActionResult> GetSection(string key)
    {
        var section = await _db.ContentSections.FirstOrDefaultAsync(cs => cs.Key == key && cs.IsActive);
        if (section == null) return NotFound();
        return Ok(section);
    }

    [HttpGet("sitemap")]
    public async Task<IActionResult> GetSitemapData()
    {
        var cars = await _db.Cars
            .Where(c => c.Status == "for_sale" || c.Status == "reserved")
            .Select(c => new { c.Slug, c.UpdatedAt })
            .ToListAsync();

        var services = await _db.Services
            .Where(s => s.IsActive)
            .Select(s => new { s.Slug, s.UpdatedAt })
            .ToListAsync();

        return Ok(new { cars, services });
    }
}

// ─── ADMIN: Indhold og indstillinger ───
[ApiController]
[Route("api/admin/content")]
[Authorize(Policy = "AdminOnly")]
public class AdminContentController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ImageService _imageService;
    private readonly AuditLogService _audit;

    public AdminContentController(AppDbContext db, ImageService imageService, AuditLogService audit)
    {
        _db = db;
        _imageService = imageService;
        _audit = audit;
    }

    // ── Settings ──
    [HttpGet("settings")]
    public async Task<IActionResult> GetAllSettings([FromQuery] string? group)
    {
        var query = _db.Settings.AsQueryable();
        if (!string.IsNullOrEmpty(group)) query = query.Where(s => s.Group == group);
        return Ok(await query.OrderBy(s => s.Group).ThenBy(s => s.Key).ToListAsync());
    }

    [HttpPut("settings/{key}")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingRequest req)
    {
        var setting = await _db.Settings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null) return NotFound(new { message = "Indstilling ikke fundet." });

        setting.Value = req.Value;
        setting.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("setting_updated", "Setting", setting.Id,
            newValues: $"{{\"key\":\"{key}\",\"value\":\"{req.Value?.Substring(0, Math.Min(50, req.Value?.Length ?? 0))}\"}}",
            userId: AuditLogService.GetUserId(User));

        return Ok(new { setting.Key, setting.Value });
    }

    [HttpPut("settings/bulk")]
    public async Task<IActionResult> UpdateSettingsBulk([FromBody] Dictionary<string, string?> updates)
    {
        foreach (var (key, value) in updates)
        {
            var setting = await _db.Settings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting != null)
            {
                setting.Value = value;
                setting.UpdatedAt = DateTime.UtcNow;
            }
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Indstillinger gemt." });
    }

    // ── Logo og billeder ──
    [HttpPost("settings/logo")]
    public async Task<IActionResult> UploadLogo(IFormFile file)
    {
        var result = await _imageService.SaveImageAsync(file, "branding");
        if (result == null) return BadRequest(new { message = "Ugyldigt billede." });

        var logoSetting = await _db.Settings.FirstOrDefaultAsync(s => s.Key == "logo_path");
        if (logoSetting == null)
        {
            _db.Settings.Add(new Setting { Key = "logo_path", Value = result.FilePath, Type = "image", Group = "branding", Description = "Logo", UpdatedAt = DateTime.UtcNow });
        }
        else
        {
            logoSetting.Value = result.FilePath;
            logoSetting.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();

        return Ok(new { logoPath = result.FilePath });
    }

    // ── Testimonials ──
    [HttpGet("testimonials")]
    public async Task<IActionResult> GetAllTestimonials()
    {
        return Ok(await _db.Testimonials.OrderBy(t => t.SortOrder).ToListAsync());
    }

    [HttpPost("testimonials")]
    public async Task<IActionResult> CreateTestimonial([FromBody] TestimonialRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var t = new Testimonial { AuthorName = req.AuthorName, AuthorTitle = req.AuthorTitle, Content = req.Content, Rating = req.Rating, Source = req.Source ?? "manual", IsActive = req.IsActive, SortOrder = req.SortOrder, CreatedAt = DateTime.UtcNow };
        _db.Testimonials.Add(t);
        await _db.SaveChangesAsync();
        return Ok(t);
    }

    [HttpPut("testimonials/{id:int}")]
    public async Task<IActionResult> UpdateTestimonial(int id, [FromBody] TestimonialRequest req)
    {
        var t = await _db.Testimonials.FindAsync(id);
        if (t == null) return NotFound();
        t.AuthorName = req.AuthorName; t.AuthorTitle = req.AuthorTitle;
        t.Content = req.Content; t.Rating = req.Rating;
        t.IsActive = req.IsActive; t.SortOrder = req.SortOrder;
        await _db.SaveChangesAsync();
        return Ok(t);
    }

    [HttpDelete("testimonials/{id:int}")]
    public async Task<IActionResult> DeleteTestimonial(int id)
    {
        var t = await _db.Testimonials.FindAsync(id);
        if (t == null) return NotFound();
        _db.Testimonials.Remove(t);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Anmeldelse slettet." });
    }

    // ── Ydelser (services) ──
    [HttpGet("services")]
    public async Task<IActionResult> GetAllServices()
    {
        return Ok(await _db.Services.OrderBy(s => s.SortOrder).ToListAsync());
    }

    [HttpPut("services/{id:int}")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateServiceRequest req)
    {
        var service = await _db.Services.FindAsync(id);
        if (service == null) return NotFound();

        service.Title = req.Title;
        service.ShortDescription = req.ShortDescription;
        service.Content = req.Content;
        service.Benefits = req.Benefits;
        service.Process = req.Process;
        service.FaqJson = req.FaqJson;
        service.IsActive = req.IsActive;
        service.SortOrder = req.SortOrder;
        service.MetaTitle = req.MetaTitle;
        service.MetaDescription = req.MetaDescription;
        service.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(service);
    }

    // ── Admin brugerstyring ──
    [HttpGet("users")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Users
            .Select(u => new { u.Id, u.Name, u.Email, u.Role, u.IsActive, u.CreatedAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpPost("users")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { message = "E-mail er allerede i brug." });

        var user = new User
        {
            Name = req.Name,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = req.Role,
            Phone = req.Phone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { user.Id, user.Name, user.Email, user.Role });
    }

    [HttpPut("users/{id:int}/password")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Adgangskode ændret." });
    }

    // ── Dashboard statistik ──
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var cars = await _db.Cars.IgnoreQueryFilters().Where(c => c.DeletedAt == null).GroupBy(c => c.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() }).ToListAsync();

        var newLeads = await _db.Leads.CountAsync(l => l.Status == "new");
        var newTradeIns = await _db.TradeInRequests.IgnoreQueryFilters().Where(t => t.DeletedAt == null).CountAsync(t => t.Status == "new");
        var newBookings = await _db.WorkshopBookings.CountAsync(b => b.Status == "new");

        var recentLeads = await _db.Leads
            .OrderByDescending(l => l.CreatedAt).Take(5)
            .Select(l => new { l.Id, l.ReferenceNumber, l.Type, l.CustomerName, l.Status, l.CreatedAt })
            .ToListAsync();

        var recentBookings = await _db.WorkshopBookings
            .OrderByDescending(b => b.CreatedAt).Take(5)
            .Select(b => new { b.Id, b.ReferenceNumber, b.CustomerName, b.Status, b.RequestedDate, b.CreatedAt })
            .ToListAsync();

        return Ok(new
        {
            cars = cars.ToDictionary(c => c.Status, c => c.Count),
            newLeads,
            newTradeIns,
            newBookings,
            recentLeads,
            recentBookings
        });
    }

    // ── Audit log ──
    [HttpGet("audit-log")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> GetAuditLog([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var total = await _db.AuditLogs.CountAsync();
        var logs = await _db.AuditLogs
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                l.Id, l.Action, l.EntityType, l.EntityId,
                UserName = l.User != null ? l.User.Name : "System",
                l.IpAddress, l.CreatedAt
            })
            .ToListAsync();

        return Ok(new { logs, total, page, pageSize });
    }

    // ── Features/Udstyr ──
    [HttpGet("features")]
    public async Task<IActionResult> GetFeatures()
    {
        return Ok(await _db.Features.OrderBy(f => f.Category).ThenBy(f => f.Name).ToListAsync());
    }

    [HttpPost("features")]
    public async Task<IActionResult> CreateFeature([FromBody] CreateFeatureRequest req)
    {
        var feature = new Feature { Name = req.Name, Category = req.Category };
        _db.Features.Add(feature);
        await _db.SaveChangesAsync();
        return Ok(feature);
    }
}

// ─── DTOs ───
public class UpdateSettingRequest
{
    public string? Value { get; set; }
}

public class TestimonialRequest
{
    [Required, MaxLength(200)] public string AuthorName { get; set; } = string.Empty;
    [MaxLength(100)] public string? AuthorTitle { get; set; }
    [Required] public string Content { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;
    public string? Source { get; set; }
}

public class UpdateServiceRequest
{
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(500)] public string? ShortDescription { get; set; }
    public string? Content { get; set; }
    public string? Benefits { get; set; }
    public string? Process { get; set; }
    public string? FaqJson { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;
    [MaxLength(200)] public string? MetaTitle { get; set; }
    [MaxLength(500)] public string? MetaDescription { get; set; }
}

public class CreateUserRequest
{
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(255)] public string Email { get; set; } = string.Empty;
    [Required, MinLength(10)] public string Password { get; set; } = string.Empty;
    [Required, MaxLength(20)] public string Role { get; set; } = "staff";
    [MaxLength(20)] public string? Phone { get; set; }
}

public class ChangePasswordRequest
{
    [Required, MinLength(10)] public string NewPassword { get; set; } = string.Empty;
}

public class CreateFeatureRequest
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [MaxLength(100)] public string? Category { get; set; }
}
