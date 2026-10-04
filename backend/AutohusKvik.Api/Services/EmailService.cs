using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace AutohusKvik.Api.Services;

public class EmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var host = _config["Email:Host"];
        var port = int.Parse(_config["Email:Port"] ?? "587");
        var username = _config["Email:Username"] ?? "";
        var password = _config["Email:Password"] ?? "";
        var fromAddress = _config["Email:FromAddress"] ?? "noreply@autohusetkvik.dk";
        var fromName = _config["Email:FromName"] ?? "Autohus Kvik";

        if (string.IsNullOrEmpty(host))
        {
            _logger.LogWarning("SMTP_HOST er ikke konfigureret. E-mail blev ikke sendt til {To}", toEmail);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromAddress));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        try
        {
            var secureSocket = port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTlsWhenAvailable;
            await client.ConnectAsync(host, port, secureSocket);

            if (!string.IsNullOrEmpty(username))
                await client.AuthenticateAsync(username, password);

            await client.SendAsync(message);
            _logger.LogInformation("E-mail sendt til {To}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fejl ved afsendelse af e-mail til {To}", toEmail);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }

    /// <summary>
    /// Offentlig metode til at sende vilkårlig HTML-e-mail.
    /// Bruges af bl.a. VehicleLookupController.
    /// </summary>
    public Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        => SendAsync(toEmail, toName, subject, htmlBody);

    public async Task SendLeadConfirmationAsync(string customerEmail, string customerName, string refNumber, string type)
    {
        var typeLabel = type switch
        {
            "car_inquiry" => "bilhenvendelse",
            "test_drive" => "prøvetur",
            "financing" => "finansieringsforespørgsel",
            _ => "henvendelse"
        };

        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
              <div style="background:#1A1A1A;padding:24px 32px;">
                <h1 style="color:#fff;margin:0;font-size:22px;">Autohus Kvik</h1>
              </div>
              <div style="padding:32px;">
                <h2>Tak for din {typeLabel}, {customerName}!</h2>
                <p>Vi har modtaget din henvendelse og vender tilbage hurtigst muligt.</p>
                <p><strong>Dit referencenummer:</strong> {refNumber}</p>
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
                <p style="color:#888;font-size:13px;">
                  Autohus Kvik · Gammel Køge Landevej 477 · 2650 Hvidovre<br>
                  Tlf: <a href="tel:+4550290874">+45 50 29 08 74</a> · 
                  <a href="mailto:kontakt@autohusetkvik.dk">kontakt@autohusetkvik.dk</a>
                </p>
              </div>
            </div>
            """;

        await SendAsync(customerEmail, customerName, $"Tak for din henvendelse – ref. {refNumber}", html);
    }

    public async Task SendLeadNotificationAsync(string refNumber, string type, string customerName, string customerEmail, string? carTitle = null)
    {
        var notificationEmails = _config["Email:NotificationEmails"] ?? _config["Email:FromAddress"] ?? "kontakt@autohusetkvik.dk";
        var emails = notificationEmails.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        var carInfo = carTitle != null ? $"<p><strong>Bil:</strong> {carTitle}</p>" : "";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <h2>Ny henvendelse – {refNumber}</h2>
              <p><strong>Type:</strong> {type}</p>
              <p><strong>Kunde:</strong> {customerName}</p>
              <p><strong>E-mail:</strong> <a href="mailto:{customerEmail}">{customerEmail}</a></p>
              {carInfo}
              <p><a href="/admin/henvendelser" style="background:#E8420F;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:16px;">Se henvendelse i admin</a></p>
            </div>
            """;

        foreach (var email in emails)
            await SendAsync(email.Trim(), "Autohus Kvik", $"Ny henvendelse: {refNumber} – {customerName}", html);
    }

    public async Task SendWorkshopBookingAdminNotificationAsync(
        string refNumber,
        string? licensePlate,
        string? carInfo,
        string? serviceTitle,
        string? taskDescription,
        string customerName,
        string? customerPhone,
        string customerEmail,
        string? requestedDate,
        string? requestedTimeSlot)
    {
        var targetEmail = "kontakt@autohusetkvik.dk";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;border:1px solid #eee;border-radius:8px;overflow:hidden;">
              <div style="background:#1A1A1A;padding:24px 32px;border-bottom:3px solid #E8420F;">
                <h1 style="color:#fff;margin:0;font-size:22px;">Autohus Kvik – Ny Værkstedsbooking</h1>
              </div>
              <div style="padding:24px 32px;">
                <p style="font-size:16px;"><strong>Referencenummer:</strong> {refNumber}</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                  <tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:8px 0;font-weight:bold;color:#666;width:140px;">Nummerplade:</td>
                    <td style="padding:8px 0;font-weight:bold;font-size:16px;color:#E8420F;">{licensePlate ?? "Ikke angivet"}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:8px 0;font-weight:bold;color:#666;">Biloplysninger:</td>
                    <td style="padding:8px 0;">{carInfo ?? "Ikke angivet"}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:8px 0;font-weight:bold;color:#666;">Valgt service:</td>
                    <td style="padding:8px 0;font-weight:bold;">{serviceTitle ?? "Ikke angivet"}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:8px 0;font-weight:bold;color:#666;">Beskrivelse:</td>
                    <td style="padding:8px 0;white-space:pre-wrap;">{taskDescription ?? "Ingen beskrivelse angivet"}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:8px 0;font-weight:bold;color:#666;">Kundenavn:</td>
                    <td style="padding:8px 0;">{customerName}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:8px 0;font-weight:bold;color:#666;">Telefon:</td>
                    <td style="padding:8px 0;"><a href="tel:{customerPhone}">{customerPhone ?? "Ikke angivet"}</a></td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0f0;">
                    <td style="padding:8px 0;font-weight:bold;color:#666;">E-mail:</td>
                    <td style="padding:8px 0;"><a href="mailto:{customerEmail}">{customerEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-weight:bold;color:#666;">Ønsket tid:</td>
                    <td style="padding:8px 0;">{requestedDate ?? "Hurtigst muligt"} ({requestedTimeSlot ?? "Fleksibel"})</td>
                  </tr>
                </table>
              </div>
            </div>
            """;

        await SendAsync(targetEmail, "Autohus Kvik Værksted", $"Ny værkstedsbooking: {refNumber} – {customerName} ({licensePlate ?? "Bil"})", html);
    }

    public async Task SendWorkshopBookingConfirmationAsync(string customerEmail, string customerName, string refNumber)
    {
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
              <div style="background:#1A1A1A;padding:24px 32px;">
                <h1 style="color:#fff;margin:0;font-size:22px;">Autohus Kvik Værksted</h1>
              </div>
              <div style="padding:32px;">
                <h2>Tak for din bookingforespørgsel, {customerName}!</h2>
                <p>Vi har modtaget din forespørgsel og bekræfter den endelige tid pr. telefon eller e-mail.</p>
                <p><strong>Dit referencenummer:</strong> {refNumber}</p>
                <p>Har du spørgsmål, er du altid velkommen til at ringe på <a href="tel:+4550290874">+45 50 29 08 74</a>.</p>
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
                <p style="color:#888;font-size:13px;">
                  Autohus Kvik · Gammel Køge Landevej 477 · 2650 Hvidovre · 
                  Nødnummer (autohjælp): <a href="tel:+4550290874">+45 50 29 08 74</a>
                </p>
              </div>
            </div>
            """;

        await SendAsync(customerEmail, customerName, $"Bookingforespørgsel modtaget – ref. {refNumber}", html);
    }

    public async Task SendTradeInConfirmationAsync(string customerEmail, string customerName, string refNumber, string requestType)
    {
        var typeText = requestType == "trade_in" ? "byttebil" : "salg af bil";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
              <div style="background:#1A1A1A;padding:24px 32px;">
                <h1 style="color:#fff;margin:0;font-size:22px;">Autohus Kvik</h1>
              </div>
              <div style="padding:32px;">
                <h2>Tak for din forespørgsel om {typeText}, {customerName}!</h2>
                <p>Vi vurderer din bil manuelt og kontakter dig hurtigst muligt med et tilbud.</p>
                <p><strong>Dit referencenummer:</strong> {refNumber}</p>
                <p style="background:#f5f5f5;padding:16px;border-radius:4px;color:#666;">
                  <em>Bemærk: Ingen automatisk prisvurdering foretages. Din bil gennemgås individuelt af vores team.</em>
                </p>
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
                <p style="color:#888;font-size:13px;">
                  Autohus Kvik · Gammel Køge Landevej 477 · 2650 Hvidovre<br>
                  Tlf: <a href="tel:+4550290874">+45 50 29 08 74</a>
                </p>
              </div>
            </div>
            """;

        await SendAsync(customerEmail, customerName, $"Vi har modtaget din forespørgsel – ref. {refNumber}", html);
    }

    public async Task SendWorkshopStatusUpdateAsync(string customerEmail, string customerName, string refNumber, string status, string? message = null)
    {
        var statusText = status switch
        {
            "confirmed" => "bekræftet",
            "cancelled" => "annulleret",
            _ => "opdateret"
        };

        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
              <div style="background:#1A1A1A;padding:24px 32px;">
                <h1 style="color:#fff;margin:0;font-size:22px;">Autohus Kvik Værksted</h1>
              </div>
              <div style="padding:32px;">
                <h2>Din booking er {statusText}</h2>
                <p><strong>Referencenummer:</strong> {refNumber}</p>
                {(message != null ? $"<p>{message}</p>" : "")}
                <p>Ring til os på <a href="tel:+4550290874">+45 50 29 08 74</a> ved spørgsmål.</p>
              </div>
            </div>
            """;

        await SendAsync(customerEmail, customerName, $"Din booking er {statusText} – ref. {refNumber}", html);
    }
}
