using AutohusKvik.Api.Data;
using AutohusKvik.Api.Models;
using AutohusKvik.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AutohusKvik.Api.Controllers;

// ─── OFFENTLIG: Indsend sælg/byt-forespørgsel ───
[ApiController]
[Route("api/trade-in")]
public class TradeInController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ImageService _imageService;
    private readonly EmailService _email;

    public TradeInController(AppDbContext db, ImageService imageService, EmailService email)
    {
        _db = db;
        _imageService = imageService;
        _email = email;
    }

    [HttpPost]
    [EnableRateLimiting("forms")]
    [RequestSizeLimit(110 * 1024 * 1024)] // Max 110 MB (10 billeder á 10 MB + overhead)
    public async Task<IActionResult> Submit([FromForm] SubmitTradeInRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (!req.PrivacyConsent) return BadRequest(new { message = "Du skal acceptere privatlivspolitikken." });
        if (!string.IsNullOrEmpty(req.HoneypotField))
            return Ok(new { referenceNumber = "KV-SPAM", message = "Tak for din henvendelse." });

        var refNumber = SlugService.GenerateReferenceNumber("BYT");

        var tradeIn = new TradeInRequest
        {
            ReferenceNumber = refNumber,
            RequestType = req.RequestType,
            LicensePlate = req.LicensePlate,
            Vin = req.Vin,
            Make = req.Make,
            Model = req.Model,
            Variant = req.Variant,
            Year = req.Year,
            Mileage = req.Mileage,
            FuelType = req.FuelType,
            Transmission = req.Transmission,
            Color = req.Color,
            HasServiceBook = req.HasServiceBook,
            LastInspection = req.LastInspection,
            KnownIssues = req.KnownIssues,
            OutstandingDebt = req.OutstandingDebt,
            NumKeys = req.NumKeys,
            WishedCarId = req.WishedCarId,
            WishedCarTitle = req.WishedCarTitle,
            CustomerName = req.CustomerName,
            CustomerEmail = req.CustomerEmail,
            CustomerPhone = req.CustomerPhone,
            PreferredContact = req.PreferredContact,
            AdditionalMessage = req.AdditionalMessage,
            PrivacyConsent = req.PrivacyConsent,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.TradeInRequests.Add(tradeIn);
        await _db.SaveChangesAsync();

        // Upload billeder (max 10)
        if (req.Images?.Any() == true)
        {
            var sortOrder = 0;
            foreach (var img in req.Images.Take(10))
            {
                var result = await _imageService.SaveImageAsync(img, $"trade-in/{tradeIn.Id}");
                if (result != null)
                {
                    _db.TradeInImages.Add(new TradeInImage
                    {
                        TradeInRequestId = tradeIn.Id,
                        FileName = result.FileName,
                        FilePath = result.FilePath,
                        WebPPath = result.WebPPath,
                        SortOrder = sortOrder++,
                        FileSizeBytes = result.FileSizeBytes
                    });
                }
            }
            await _db.SaveChangesAsync();
        }

        // Send e-mails
        _ = Task.Run(async () =>
        {
            await _email.SendTradeInConfirmationAsync(tradeIn.CustomerEmail, tradeIn.CustomerName, refNumber, tradeIn.RequestType);
            await _email.SendLeadNotificationAsync(refNumber, "trade_in", tradeIn.CustomerName, tradeIn.CustomerEmail);
        });

        return Ok(new { referenceNumber = refNumber, message = "Din forespørgsel er modtaget. Vi vurderer din bil og kontakter dig snarest." });
    }
}

// ─── ADMIN: Behandl sælg/byt-forespørgsler ───
[ApiController]
[Route("api/admin/trade-in")]
[Authorize(Policy = "AdminOnly")]
public class AdminTradeInController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuditLogService _audit;
    private readonly EmailService _email;

    public AdminTradeInController(AppDbContext db, AuditLogService audit, EmailService email)
    {
        _db = db;
        _audit = audit;
        _email = email;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.TradeInRequests.IgnoreQueryFilters().Where(t => t.DeletedAt == null).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(t => t.Status == status);
        if (!string.IsNullOrEmpty(type)) query = query.Where(t => t.RequestType == type);
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(t =>
                t.CustomerName.ToLower().Contains(s) ||
                t.CustomerEmail.ToLower().Contains(s) ||
                (t.Make != null && t.Make.ToLower().Contains(s)) ||
                t.ReferenceNumber.ToLower().Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                t.Id, t.ReferenceNumber, t.RequestType, t.LicensePlate,
                t.Make, t.Model, t.Year, t.Mileage,
                t.CustomerName, t.CustomerEmail, t.CustomerPhone,
                t.Status, t.OfferedPrice, t.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _db.TradeInRequests
            .IgnoreQueryFilters()
            .Include(t => t.Images)
            .Include(t => t.WishedCar)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTradeInStatusRequest req)
    {
        var item = await _db.TradeInRequests.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
        if (item == null) return NotFound();

        item.Status = req.Status;
        item.OfferedPrice = req.OfferedPrice ?? item.OfferedPrice;
        item.InternalNotes = req.Notes ?? item.InternalNotes;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("trade_in_status_updated", "TradeInRequest", id,
            newValues: $"{{\"status\":\"{req.Status}\"}}",
            userId: AuditLogService.GetUserId(User));

        return Ok(new { item.Id, item.Status });
    }
}

// ─── Offentlig: Værksted ───
[ApiController]
[Route("api/workshop")]
public class WorkshopController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailService _email;

    public WorkshopController(AppDbContext db, EmailService email)
    {
        _db = db;
        _email = email;
    }

    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var services = await _db.Services
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .ToListAsync();
        return Ok(services);
    }

    [HttpGet("services/{slug}")]
    public async Task<IActionResult> GetService(string slug)
    {
        var service = await _db.Services.FirstOrDefaultAsync(s => s.Slug == slug && s.IsActive);
        if (service == null) return NotFound(new { message = "Ydelse ikke fundet." });
        return Ok(service);
    }

    [HttpPost("bookings")]
    [EnableRateLimiting("forms")]
    [RequestSizeLimit(55 * 1024 * 1024)]
    public async Task<IActionResult> SubmitBooking()
    {
        SubmitBookingRequest req;
        if (Request.HasFormContentType)
        {
            var form = await Request.ReadFormAsync();
            req = new SubmitBookingRequest
            {
                ServiceIds = form["serviceIds"].FirstOrDefault(),
                ServiceDescription = form["serviceDescription"].FirstOrDefault() ?? form["selectedService"].FirstOrDefault(),
                LicensePlate = form["licensePlate"].FirstOrDefault() ?? form["registrationNumber"].FirstOrDefault(),
                CarMake = form["carMake"].FirstOrDefault() ?? form["make"].FirstOrDefault(),
                CarModel = form["carModel"].FirstOrDefault() ?? form["model"].FirstOrDefault(),
                TaskDescription = form["taskDescription"].FirstOrDefault() ?? form["description"].FirstOrDefault(),
                CustomerName = form["customerName"].FirstOrDefault() ?? "",
                CustomerEmail = form["customerEmail"].FirstOrDefault() ?? "",
                CustomerPhone = form["customerPhone"].FirstOrDefault(),
                RequestedTimeSlot = form["requestedTimeSlot"].FirstOrDefault() ?? form["preferredTimeSlot"].FirstOrDefault(),
                HoneypotField = form["honeypotField"].FirstOrDefault(),
                PrivacyConsent = true,
                Images = form.Files
            };
            if (DateTime.TryParse(form["requestedDate"].FirstOrDefault() ?? form["preferredDate"].FirstOrDefault(), out var parsedDate))
            {
                req.RequestedDate = parsedDate;
            }
            if (int.TryParse(form["carYear"].FirstOrDefault() ?? form["year"].FirstOrDefault(), out var parsedYear))
            {
                req.CarYear = parsedYear;
            }
            if (int.TryParse(form["carMileage"].FirstOrDefault() ?? form["mileage"].FirstOrDefault(), out var parsedMileage))
            {
                req.CarMileage = parsedMileage;
            }
        }
        else
        {
            req = await Request.ReadFromJsonAsync<SubmitBookingRequest>() ?? new SubmitBookingRequest();
        }

        if (string.IsNullOrWhiteSpace(req.CustomerName))
            return BadRequest(new { message = "Navn er påkrævet." });
        if (string.IsNullOrWhiteSpace(req.CustomerEmail))
            return BadRequest(new { message = "E-mail er påkrævet." });

        if (!string.IsNullOrEmpty(req.HoneypotField))
            return Ok(new { referenceNumber = "KV-SPAM", message = "Tak for din booking." });

        var refNumber = SlugService.GenerateReferenceNumber("WS");

        var booking = new WorkshopBooking
        {
            ReferenceNumber = refNumber,
            ServiceIds = req.ServiceIds,
            ServiceDescription = req.ServiceDescription,
            RequestedDate = req.RequestedDate,
            RequestedTimeSlot = req.RequestedTimeSlot,
            LicensePlate = req.LicensePlate?.Trim().ToUpper(),
            CarMake = req.CarMake,
            CarModel = req.CarModel,
            CarYear = req.CarYear,
            CarMileage = req.CarMileage,
            TaskDescription = req.TaskDescription,
            WantsQuoteFirst = req.WantsQuoteFirst,
            WillWaitOnsite = req.WillWaitOnsite,
            NeedsLoanCar = req.NeedsLoanCar,
            WantsCallback = req.WantsCallback,
            CustomerName = req.CustomerName.Trim(),
            CustomerEmail = req.CustomerEmail.Trim(),
            CustomerPhone = req.CustomerPhone?.Trim(),
            PreferredContact = req.PreferredContact,
            PrivacyConsent = true,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.WorkshopBookings.Add(booking);
        await _db.SaveChangesAsync();

        var carInfo = $"{booking.CarMake} {booking.CarModel} {(booking.CarYear > 0 ? booking.CarYear.ToString() : "")}".Trim();
        var dateStr = booking.RequestedDate.HasValue ? booking.RequestedDate.Value.ToString("dd-MM-yyyy") : null;

        // Send e-mails
        _ = Task.Run(async () =>
        {
            try
            {
                await _email.SendWorkshopBookingConfirmationAsync(booking.CustomerEmail, booking.CustomerName, refNumber);
            }
            catch {}

            try
            {
                await _email.SendWorkshopBookingAdminNotificationAsync(
                    refNumber,
                    booking.LicensePlate,
                    string.IsNullOrWhiteSpace(carInfo) ? null : carInfo,
                    booking.ServiceDescription,
                    booking.TaskDescription,
                    booking.CustomerName,
                    booking.CustomerPhone,
                    booking.CustomerEmail,
                    dateStr,
                    booking.RequestedTimeSlot
                );
            }
            catch {}
        });

        return Ok(new { 
            referenceNumber = refNumber, 
            message = "Tak, din forespørgsel er sendt. Autohus Kvik kontakter dig hurtigst muligt." 
        });
    }
}

// ─── ADMIN: Værkstedsbookinger ───
[ApiController]
[Route("api/admin/workshop")]
[Authorize(Policy = "AdminOnly")]
public class AdminWorkshopController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailService _email;
    private readonly AuditLogService _audit;

    public AdminWorkshopController(AppDbContext db, EmailService email, AuditLogService audit)
    {
        _db = db;
        _email = email;
        _audit = audit;
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.WorkshopBookings.AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(b => b.Status == status);
        if (from.HasValue) query = query.Where(b => b.RequestedDate >= from.Value);
        if (to.HasValue) query = query.Where(b => b.RequestedDate <= to.Value);

        var total = await query.CountAsync();
        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new
            {
                b.Id, b.ReferenceNumber, b.LicensePlate, b.CarMake, b.CarModel,
                b.CustomerName, b.CustomerEmail, b.CustomerPhone,
                b.RequestedDate, b.RequestedTimeSlot, b.Status,
                b.WantsQuoteFirst, b.NeedsLoanCar, b.CreatedAt
            })
            .ToListAsync();

        return Ok(new { bookings, total, page, pageSize });
    }

    [HttpGet("bookings/{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var booking = await _db.WorkshopBookings.Include(b => b.Images).FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound();
        return Ok(booking);
    }

    [HttpPatch("bookings/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateWorkshopStatusRequest req)
    {
        var booking = await _db.WorkshopBookings.FindAsync(id);
        if (booking == null) return NotFound();

        var oldStatus = booking.Status;
        booking.Status = req.Status;
        booking.InternalNotes = req.Notes ?? booking.InternalNotes;
        booking.ConfirmedDate = req.ConfirmedDate ?? booking.ConfirmedDate;
        booking.ConfirmedTimeSlot = req.ConfirmedTimeSlot ?? booking.ConfirmedTimeSlot;
        booking.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        // Send statusopdatering til kunden
        if (req.SendEmailToCustomer && (req.Status == "confirmed" || req.Status == "cancelled"))
        {
            _ = Task.Run(async () =>
                await _email.SendWorkshopStatusUpdateAsync(
                    booking.CustomerEmail, booking.CustomerName, booking.ReferenceNumber,
                    req.Status, req.CustomerMessage));
        }

        await _audit.LogAsync("workshop_status_updated", "WorkshopBooking", id,
            oldValues: $"{{\"status\":\"{oldStatus}\"}}",
            newValues: $"{{\"status\":\"{req.Status}\"}}",
            userId: AuditLogService.GetUserId(User));

        return Ok(new { booking.Id, booking.Status });
    }
}

// ─── DTOs ───
public class SubmitTradeInRequest
{
    [Required, MaxLength(20)] public string RequestType { get; set; } = "sell";
    [MaxLength(20)] public string? LicensePlate { get; set; }
    [MaxLength(50)] public string? Vin { get; set; }
    [MaxLength(100)] public string? Make { get; set; }
    [MaxLength(100)] public string? Model { get; set; }
    [MaxLength(200)] public string? Variant { get; set; }
    public int? Year { get; set; }
    public int? Mileage { get; set; }
    [MaxLength(50)] public string? FuelType { get; set; }
    [MaxLength(50)] public string? Transmission { get; set; }
    [MaxLength(50)] public string? Color { get; set; }
    public bool HasServiceBook { get; set; }
    [MaxLength(500)] public string? LastInspection { get; set; }
    public string? KnownIssues { get; set; }
    public decimal? OutstandingDebt { get; set; }
    public int? NumKeys { get; set; }
    public int? WishedCarId { get; set; }
    [MaxLength(200)] public string? WishedCarTitle { get; set; }
    [Required, MaxLength(200)] public string CustomerName { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(255)] public string CustomerEmail { get; set; } = string.Empty;
    [MaxLength(20)] public string? CustomerPhone { get; set; }
    [MaxLength(20)] public string? PreferredContact { get; set; }
    public string? AdditionalMessage { get; set; }
    [Required] public bool PrivacyConsent { get; set; }
    public IFormFileCollection? Images { get; set; }
    public string? HoneypotField { get; set; }
    public DateTime? FirstRegistration { get; set; }
}

public class UpdateTradeInStatusRequest
{
    [Required] public string Status { get; set; } = string.Empty;
    public decimal? OfferedPrice { get; set; }
    public string? Notes { get; set; }
}

public class SubmitBookingRequest
{
    public string? ServiceIds { get; set; }
    [MaxLength(500)] public string? ServiceDescription { get; set; }
    public DateTime? RequestedDate { get; set; }
    [MaxLength(50)] public string? RequestedTimeSlot { get; set; }
    [MaxLength(20)] public string? LicensePlate { get; set; }
    [MaxLength(100)] public string? CarMake { get; set; }
    [MaxLength(100)] public string? CarModel { get; set; }
    public int? CarYear { get; set; }
    public int? CarMileage { get; set; }
    public string? TaskDescription { get; set; }
    public bool WantsQuoteFirst { get; set; }
    public bool WillWaitOnsite { get; set; }
    public bool NeedsLoanCar { get; set; }
    public bool WantsCallback { get; set; }
    [Required, MaxLength(200)] public string CustomerName { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(255)] public string CustomerEmail { get; set; } = string.Empty;
    [MaxLength(20)] public string? CustomerPhone { get; set; }
    [MaxLength(20)] public string? PreferredContact { get; set; }
    [Required] public bool PrivacyConsent { get; set; }
    public IFormFileCollection? Images { get; set; }
    public string? HoneypotField { get; set; }
}

public class UpdateWorkshopStatusRequest
{
    [Required] public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? ConfirmedDate { get; set; }
    public string? ConfirmedTimeSlot { get; set; }
    public bool SendEmailToCustomer { get; set; } = false;
    public string? CustomerMessage { get; set; }
}
