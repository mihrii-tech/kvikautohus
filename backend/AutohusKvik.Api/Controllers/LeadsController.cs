using AutohusKvik.Api.Data;
using AutohusKvik.Api.Models;
using AutohusKvik.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AutohusKvik.Api.Controllers;

// ─── OFFENTLIG: Indsend henvendelse ───
[ApiController]
[Route("api/leads")]
public class LeadsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailService _email;

    public LeadsController(AppDbContext db, EmailService email)
    {
        _db = db;
        _email = email;
    }

    [HttpPost]
    [EnableRateLimiting("forms")]
    public async Task<IActionResult> Submit([FromBody] SubmitLeadRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Honeypot-tjek
        if (!string.IsNullOrEmpty(req.HoneypotField))
            return Ok(new { referenceNumber = "KV-SPAM", message = "Tak for din henvendelse." });

        var refNumber = SlugService.GenerateReferenceNumber("KV");

        Car? car = null;
        if (req.CarId.HasValue)
            car = await _db.Cars.FindAsync(req.CarId.Value);

        var lead = new Lead
        {
            ReferenceNumber = refNumber,
            Type = req.Type,
            CarId = req.CarId,
            CarTitle = car?.Title,
            CustomerName = req.CustomerName,
            CustomerEmail = req.CustomerEmail,
            CustomerPhone = req.CustomerPhone,
            PreferredContact = req.PreferredContact,
            Subject = req.Subject,
            Message = req.Message,
            DesiredDownPayment = req.DesiredDownPayment,
            DesiredTermMonths = req.DesiredTermMonths,
            PrivacyConsent = req.PrivacyConsent,
            MarketingConsent = req.MarketingConsent,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();

        // Send e-mails (ikke-blokerende)
        _ = Task.Run(async () =>
        {
            await _email.SendLeadConfirmationAsync(lead.CustomerEmail, lead.CustomerName, refNumber, lead.Type);
            await _email.SendLeadNotificationAsync(refNumber, lead.Type, lead.CustomerName, lead.CustomerEmail, lead.CarTitle);
        });

        lead.EmailSent = true;
        await _db.SaveChangesAsync();

        return Ok(new { referenceNumber = refNumber, message = "Din henvendelse er modtaget. Vi vender tilbage hurtigst muligt." });
    }
}

// ─── ADMIN: Behandl henvendelser ───
[ApiController]
[Route("api/admin/leads")]
[Authorize(Policy = "AdminOnly")]
public class AdminLeadsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuditLogService _audit;

    public AdminLeadsController(AppDbContext db, AuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Leads.AsQueryable();
        if (!string.IsNullOrEmpty(type)) query = query.Where(l => l.Type == type);
        if (!string.IsNullOrEmpty(status)) query = query.Where(l => l.Status == status);
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(l =>
                l.CustomerName.ToLower().Contains(s) ||
                l.CustomerEmail.ToLower().Contains(s) ||
                (l.CarTitle != null && l.CarTitle.ToLower().Contains(s)) ||
                l.ReferenceNumber.ToLower().Contains(s));
        }

        var total = await query.CountAsync();
        var leads = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                l.Id, l.ReferenceNumber, l.Type, l.CustomerName, l.CustomerEmail,
                l.CustomerPhone, l.CarTitle, l.Status, l.AssignedTo, l.CreatedAt
            })
            .ToListAsync();

        return Ok(new { leads, total, page, pageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var lead = await _db.Leads.FirstOrDefaultAsync(l => l.Id == id);
        if (lead == null) return NotFound();
        return Ok(lead);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
    {
        var lead = await _db.Leads.FirstOrDefaultAsync(l => l.Id == id);
        if (lead == null) return NotFound();

        lead.Status = req.Status;
        lead.InternalNotes = req.Notes ?? lead.InternalNotes;
        lead.AssignedTo = req.AssignedTo ?? lead.AssignedTo;
        lead.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("lead_status_updated", "Lead", id,
            newValues: $"{{\"status\":\"{req.Status}\"}}",
            userId: AuditLogService.GetUserId(User));

        return Ok(new { lead.Id, lead.Status });
    }

    [HttpGet("export")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<IActionResult> ExportCsv([FromQuery] string? type, [FromQuery] string? status)
    {
        var query = _db.Leads.AsQueryable();
        if (!string.IsNullOrEmpty(type)) query = query.Where(l => l.Type == type);
        if (!string.IsNullOrEmpty(status)) query = query.Where(l => l.Status == status);

        var leads = await query.OrderByDescending(l => l.CreatedAt).ToListAsync();

        var csv = "Ref,Type,Navn,Email,Telefon,Bil,Status,Oprettet\n" +
            string.Join("\n", leads.Select(l =>
                $"{l.ReferenceNumber},{l.Type},{l.CustomerName},{l.CustomerEmail},{l.CustomerPhone ?? ""},\"{l.CarTitle ?? ""}\",{l.Status},{l.CreatedAt:yyyy-MM-dd}"));

        return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", $"henvendelser-{DateTime.Now:yyyyMMdd}.csv");
    }
}

public class SubmitLeadRequest
{
    [Required, MaxLength(50)]
    public string Type { get; set; } = "contact";
    public int? CarId { get; set; }
    [Required, MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(255)]
    public string CustomerEmail { get; set; } = string.Empty;
    [MaxLength(20)]
    public string? CustomerPhone { get; set; }
    [MaxLength(20)]
    public string? PreferredContact { get; set; }
    [MaxLength(100)]
    public string? Subject { get; set; }
    public string? Message { get; set; }
    public decimal? DesiredDownPayment { get; set; }
    public int? DesiredTermMonths { get; set; }
    [Required]
    public bool PrivacyConsent { get; set; }
    public bool MarketingConsent { get; set; }
    // Honeypot – bots udfylder dette felt, rigtige brugere gør ikke
    public string? HoneypotField { get; set; }
}

public class UpdateStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? AssignedTo { get; set; }
}
