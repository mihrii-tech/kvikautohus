using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutohusKvik.Api.Models;

public class WorkshopBooking
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string ReferenceNumber { get; set; } = string.Empty;

    // Valgte ydelser (kommaseparerede ID'er eller JSON)
    public string? ServiceIds { get; set; }

    [MaxLength(500)]
    public string? ServiceDescription { get; set; }

    // Ønsket tid
    public DateTime? RequestedDate { get; set; }

    [MaxLength(50)]
    public string? RequestedTimeSlot { get; set; }

    // Biloplysninger
    [MaxLength(20)]
    public string? LicensePlate { get; set; }

    [MaxLength(100)]
    public string? CarMake { get; set; }

    [MaxLength(100)]
    public string? CarModel { get; set; }

    public int? CarYear { get; set; }

    public int? CarMileage { get; set; }

    // Opgavebeskrivelse
    public string? TaskDescription { get; set; }

    // Tilvalg
    public bool WantsQuoteFirst { get; set; } = false;

    public bool WillWaitOnsite { get; set; } = false;

    public bool NeedsLoanCar { get; set; } = false;

    public bool WantsCallback { get; set; } = false;

    // Kundeoplysninger
    [Required, MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string CustomerEmail { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? CustomerPhone { get; set; }

    [MaxLength(20)]
    public string? PreferredContact { get; set; }

    public bool PrivacyConsent { get; set; } = false;

    // Status og behandling
    /// <summary>new | pending | confirmed | in_progress | completed | cancelled</summary>
    [Required, MaxLength(20)]
    public string Status { get; set; } = "new";

    public DateTime? ConfirmedDate { get; set; }

    [MaxLength(50)]
    public string? ConfirmedTimeSlot { get; set; }

    public string? InternalNotes { get; set; }

    [MaxLength(100)]
    public string? AssignedTo { get; set; }

    // Metadata
    [MaxLength(50)]
    public string? IpAddress { get; set; }

    public bool EmailSent { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<WorkshopBookingImage> Images { get; set; } = new List<WorkshopBookingImage>();
}

public class WorkshopBookingImage
{
    [Key]
    public int Id { get; set; }

    public int WorkshopBookingId { get; set; }

    [Required, MaxLength(500)]
    public string FileName { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? WebPPath { get; set; }

    public int SortOrder { get; set; } = 0;

    public long FileSizeBytes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(WorkshopBookingId))]
    public WorkshopBooking WorkshopBooking { get; set; } = null!;
}
