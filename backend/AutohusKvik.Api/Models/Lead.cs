using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutohusKvik.Api.Models;

public class Lead
{
    [Key]
    public int Id { get; set; }

    /// <summary>Referencenummer vist for kunden, fx KV-20240001</summary>
    [Required, MaxLength(50)]
    public string ReferenceNumber { get; set; } = string.Empty;

    /// <summary>car_inquiry | test_drive | financing | contact</summary>
    [Required, MaxLength(50)]
    public string Type { get; set; } = "contact";

    public int? CarId { get; set; }

    [MaxLength(200)]
    public string? CarTitle { get; set; }

    // Kundeoplysninger
    [Required, MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string CustomerEmail { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? CustomerPhone { get; set; }

    /// <summary>email | phone | any</summary>
    [MaxLength(20)]
    public string? PreferredContact { get; set; }

    [MaxLength(100)]
    public string? Subject { get; set; }

    public string? Message { get; set; }

    // Finansieringsrelaterede felter
    [Column(TypeName = "decimal(10,2)")]
    public decimal? DesiredDownPayment { get; set; }

    public int? DesiredTermMonths { get; set; }

    // Status og behandling
    /// <summary>new | contacted | appointment | completed | rejected</summary>
    [Required, MaxLength(20)]
    public string Status { get; set; } = "new";

    [MaxLength(100)]
    public string? AssignedTo { get; set; }

    public string? InternalNotes { get; set; }

    // Samtykke
    public bool PrivacyConsent { get; set; } = false;

    public bool MarketingConsent { get; set; } = false;

    // Metadata
    [MaxLength(50)]
    public string? IpAddress { get; set; }

    public bool EmailSent { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(CarId))]
    public Car? Car { get; set; }
}
