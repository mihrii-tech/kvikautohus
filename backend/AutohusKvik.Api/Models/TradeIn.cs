using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutohusKvik.Api.Models;

public class TradeInRequest
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string ReferenceNumber { get; set; } = string.Empty;

    /// <summary>sell | trade_in</summary>
    [Required, MaxLength(20)]
    public string RequestType { get; set; } = "sell";

    // Biloplysninger
    [MaxLength(20)]
    public string? LicensePlate { get; set; }

    [MaxLength(50)]
    public string? Vin { get; set; }

    [MaxLength(100)]
    public string? Make { get; set; }

    [MaxLength(100)]
    public string? Model { get; set; }

    [MaxLength(200)]
    public string? Variant { get; set; }

    public int? Year { get; set; }

    public DateTime? FirstRegistration { get; set; }

    public int? Mileage { get; set; }

    [MaxLength(50)]
    public string? FuelType { get; set; }

    [MaxLength(50)]
    public string? Transmission { get; set; }

    [MaxLength(50)]
    public string? Color { get; set; }

    // Bilens stand
    public bool HasServiceBook { get; set; } = false;

    [MaxLength(500)]
    public string? LastInspection { get; set; }

    public string? KnownIssues { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? OutstandingDebt { get; set; }

    public int? NumKeys { get; set; }

    // Bytte: ønsket bil fra lager
    public int? WishedCarId { get; set; }

    [MaxLength(200)]
    public string? WishedCarTitle { get; set; }

    // Kundeoplysninger
    [Required, MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string CustomerEmail { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? CustomerPhone { get; set; }

    [MaxLength(20)]
    public string? PreferredContact { get; set; }

    public string? AdditionalMessage { get; set; }

    public bool PrivacyConsent { get; set; } = false;

    // Status og behandling
    /// <summary>new | contacted | evaluated | offer_sent | completed | rejected</summary>
    [Required, MaxLength(30)]
    public string Status { get; set; } = "new";

    [Column(TypeName = "decimal(10,2)")]
    public decimal? OfferedPrice { get; set; }

    public string? InternalNotes { get; set; }

    [MaxLength(100)]
    public string? AssignedTo { get; set; }

    // Metadata
    [MaxLength(50)]
    public string? IpAddress { get; set; }

    public bool EmailSent { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(WishedCarId))]
    public Car? WishedCar { get; set; }

    public ICollection<TradeInImage> Images { get; set; } = new List<TradeInImage>();
}

public class TradeInImage
{
    [Key]
    public int Id { get; set; }

    public int TradeInRequestId { get; set; }

    [Required, MaxLength(500)]
    public string FileName { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? WebPPath { get; set; }

    public int SortOrder { get; set; } = 0;

    public long FileSizeBytes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(TradeInRequestId))]
    public TradeInRequest TradeInRequest { get; set; } = null!;
}
