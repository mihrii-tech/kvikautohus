using AutohusKvik.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace AutohusKvik.Api.Controllers;

/// <summary>
/// Offentligt endpoint til nummerplade/VIN-opslag via Synsbasen.
/// Rate-limited til max 10 opslag pr. IP pr. time.
/// API-nøglen forbliver udelukkende på serveren.
///
/// Brug:
///   GET /api/vehicle-lookup?type=registration&value=DN81822
///   GET /api/vehicle-lookup?type=vin&value=WVWZZZ3CZWE123456
/// </summary>
[ApiController]
[Route("api/vehicle-lookup")]
public class VehicleLookupController : ControllerBase
{
    private readonly SynsbasenService _synsbasen;
    private readonly EmailService _email;
    private readonly ILogger<VehicleLookupController> _logger;

    public VehicleLookupController(SynsbasenService synsbasen, EmailService email, ILogger<VehicleLookupController> logger)
    {
        _synsbasen = synsbasen;
        _email = email;
        _logger = logger;
    }

    /// <summary>
    /// Slå køretøj op via nummerplade eller stelnummer (VIN).
    /// Returnerer altid HTTP 200 med found: true/false for at undgå 404 fejl i browser console.
    /// </summary>
    [HttpGet]
    [EnableRateLimiting("vehicle-lookup")]
    public async Task<IActionResult> Lookup(
        [FromQuery] string? type,
        [FromQuery] string? value,
        [FromQuery] string? registration,
        [FromQuery] string? vin)
    {
        // Understøt både ?type=registration&value=... og ?registration=... / ?vin=...
        if (!string.IsNullOrWhiteSpace(registration))
        {
            type = "registration";
            value = registration;
        }
        else if (!string.IsNullOrWhiteSpace(vin))
        {
            type = "vin";
            value = vin;
        }

        if (string.IsNullOrWhiteSpace(type) || string.IsNullOrWhiteSpace(value))
        {
            return Ok(new
            {
                found = false,
                message = "Bilen blev ikke fundet, men kunden kan fortsætte manuelt."
            });
        }

        var cleanValue = value.Replace(" ", "").Replace("-", "").ToUpper().Trim();
        VehicleLookupResult? result = null;

        if (type.Equals("registration", StringComparison.OrdinalIgnoreCase))
        {
            if (cleanValue.Length > 7 || cleanValue.Length < 2)
            {
                return Ok(new
                {
                    found = false,
                    message = "Bilen blev ikke fundet, men kunden kan fortsætte manuelt."
                });
            }

            _logger.LogInformation("Nummerpladeopslag: {Reg} fra IP {IP}", cleanValue,
                HttpContext.Connection.RemoteIpAddress?.ToString());

            result = await _synsbasen.LookupByRegistrationAsync(cleanValue);
        }
        else if (type.Equals("vin", StringComparison.OrdinalIgnoreCase))
        {
            if (cleanValue.Length != 17)
            {
                return Ok(new
                {
                    found = false,
                    message = "Bilen blev ikke fundet, men kunden kan fortsætte manuelt."
                });
            }

            _logger.LogInformation("VIN-opslag: {Vin} fra IP {IP}", cleanValue,
                HttpContext.Connection.RemoteIpAddress?.ToString());

            result = await _synsbasen.LookupByVinAsync(cleanValue);
        }
        else
        {
            return Ok(new
            {
                found = false,
                message = "Bilen blev ikke fundet, men kunden kan fortsætte manuelt."
            });
        }

        if (result == null)
        {
            return Ok(new
            {
                found = false,
                message = "Bilen blev ikke fundet, men kunden kan fortsætte manuelt."
            });
        }

        result.Found = true;
        return Ok(result);
    }

    /// <summary>
    /// Modtag lead-henvendelse fra nummerplade-opslag.
    /// POST /api/vehicle-lookup/lead
    /// </summary>
    [HttpPost("lead")]
    [EnableRateLimiting("forms")]
    public async Task<IActionResult> SubmitLead([FromBody] VehicleLookupLeadRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Honeypot – bots udfylder dette felt
        if (!string.IsNullOrEmpty(req.HoneypotField))
            return Ok(new { message = "Tak for din henvendelse!" });

        _logger.LogInformation("Nummerplade-lead modtaget: {Name} – {Plate}", req.CustomerName, req.LicensePlate);

        // Byg kundebekræftelses-email
        var customerHtml = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
              <div style="background:#1A1A1A;padding:24px 32px;">
                <h1 style="color:#fff;margin:0;font-size:22px;">Autohus Kvik</h1>
              </div>
              <div style="padding:32px;">
                <h2>Tak for din henvendelse, {req.CustomerName}!</h2>
                <p>Vi har modtaget din forespørgsel vedrørende bil med nummerplade <strong>{req.LicensePlate}</strong>.</p>
                <p><strong>Din besked:</strong></p>
                <p style="background:#f5f5f5;padding:16px;border-radius:4px;">{req.Message ?? "Ingen yderligere besked."}</p>
                <p>Vi vender tilbage hurtigst muligt – typisk inden for 24 timer.</p>
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
                <p style="color:#888;font-size:13px;">
                  Autohus Kvik · Gammel Køge Landevej 477 · 2650 Hvidovre<br>
                  Tlf: <a href="tel:+4550290874">+45 50 29 08 74</a> ·
                  <a href="mailto:kontakt@autohusetkvik.dk">kontakt@autohusetkvik.dk</a>
                </p>
              </div>
            </div>
            """;

        // Send e-mails asynkront (ikke-blokerende for klienten)
        _ = Task.Run(async () =>
        {
            try
            {
                // Bekræftelse til kunden
                await _email.SendEmailAsync(req.CustomerEmail, req.CustomerName,
                    "Tak for din henvendelse – Autohus Kvik", customerHtml);

                // Notifikation til Autohus Kvik
                var notificationHtml = $"""
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                      <h2>Ny henvendelse fra nummerpladeopslag</h2>
                      <p><strong>Nummerplade/Stelnr.:</strong> {req.LicensePlate}</p>
                      <p><strong>Navn:</strong> {req.CustomerName}</p>
                      <p><strong>E-mail:</strong> <a href="mailto:{req.CustomerEmail}">{req.CustomerEmail}</a></p>
                      <p><strong>Telefon:</strong> {req.CustomerPhone ?? "Ikke angivet"}</p>
                      <p><strong>Besked:</strong></p>
                      <p style="background:#f5f5f5;padding:16px;border-radius:4px;">{req.Message ?? "Ingen besked"}</p>
                    </div>
                    """;

                await _email.SendEmailAsync("kontakt@autohusetkvik.dk", "Autohus Kvik",
                    $"Nyt nummerplade-lead: {req.LicensePlate} – {req.CustomerName}", notificationHtml);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fejl ved afsendelse af nummerplade-lead e-mails");
            }
        });

        return Ok(new { message = "Tak for din henvendelse! Vi kontakter dig hurtigst muligt." });
    }
}

public class VehicleLookupLeadRequest
{
    [Required, MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(255)]
    public string CustomerEmail { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? CustomerPhone { get; set; }

    public string? Message { get; set; }

    [MaxLength(20)]
    public string? LicensePlate { get; set; }

    [Required]
    public bool PrivacyConsent { get; set; }

    // Honeypot – bots udfylder dette felt, rigtige brugere gør ikke
    public string? HoneypotField { get; set; }
}
