using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutohusKvik.Api.Models;

public class Car
{
    [Key]
    public int Id { get; set; }

    // Grundoplysninger
    [Required, MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Make { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Variant { get; set; }

    public int Year { get; set; }

    [MaxLength(50)]
    public string? BodyType { get; set; }

    [MaxLength(50)]
    public string? Color { get; set; }

    [MaxLength(20)]
    public string? ColorHex { get; set; }

    // Tekniske data
    [MaxLength(50)]
    public string? FuelType { get; set; }

    [MaxLength(50)]
    public string? Transmission { get; set; }

    public int? Mileage { get; set; }

    public int? Horsepower { get; set; }

    [MaxLength(50)]
    public string? EngineSize { get; set; }

    public decimal? FuelConsumption { get; set; }

    public decimal? ElectricRange { get; set; }

    public decimal? Co2Emission { get; set; }

    public decimal? GreenTax { get; set; }

    public int? NumDoors { get; set; }

    public int? NumSeats { get; set; }

    [MaxLength(20)]
    public string? DriveType { get; set; }

    public DateTime? FirstRegistration { get; set; }

    public int? ModelYear { get; set; }

    // Pris og økonomi
    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? MonthlyPayment { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? DownPayment { get; set; }

    public int? LoanTermMonths { get; set; }

    [Column(TypeName = "decimal(5,4)")]
    public decimal? InterestRate { get; set; }

    // Status og synlighed
    /// <summary>draft | for_sale | reserved | sold | archived</summary>
    [Required, MaxLength(20)]
    public string Status { get; set; } = "draft";

    public bool IsFeatured { get; set; } = false;

    public bool IsNew { get; set; } = false;

    /// <summary>Valgfri etiket: NYHED, PÅ VEJ, TILBUD osv.</summary>
    [MaxLength(50)]
    public string? Badge { get; set; }

    // Garanti og klargøring
    public bool HasWarranty { get; set; } = false;

    [MaxLength(500)]
    public string? WarrantyDetails { get; set; }

    public bool IsPrepared { get; set; } = false;

    public bool HasServiceHistory { get; set; } = false;

    public bool IsInspected { get; set; } = false;

    // SEO
    [MaxLength(200)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    // Fri beskrivelse
    public string? Description { get; set; }

    // Finansiering og garanti-infotekst (redigerbar pr. bil)
    public string? FinancingInfo { get; set; }

    public string? WarrantyInfo { get; set; }

    public string? TradeInInfo { get; set; }

    // Stelnummer (vises kun internt i admin)
    [MaxLength(50)]
    public string? Vin { get; set; }

    // Timestamps og soft delete
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation
    public ICollection<CarImage> Images { get; set; } = new List<CarImage>();
    public ICollection<CarFeature> CarFeatures { get; set; } = new List<CarFeature>();
    public ICollection<Lead> Leads { get; set; } = new List<Lead>();
}
