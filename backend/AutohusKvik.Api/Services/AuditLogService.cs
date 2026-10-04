using AutohusKvik.Api.Data;
using AutohusKvik.Api.Models;
using System.Security.Claims;

namespace AutohusKvik.Api.Services;

public class AuditLogService
{
    private readonly AppDbContext _db;

    public AuditLogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(
        string action,
        string? entityType = null,
        int? entityId = null,
        string? oldValues = null,
        string? newValues = null,
        int? userId = null,
        string? ipAddress = null)
    {
        var log = new AuditLog
        {
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            UserId = userId,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }

    public static int? GetUserId(ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? user.FindFirst("userId")?.Value;
        return int.TryParse(idClaim, out var id) ? id : null;
    }
}
