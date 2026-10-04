using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutohusKvik.Api.Models;

public class Feature
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Kategori: Sikkerhed, Komfort, Infotainment, Eksterior, Interiør osv.</summary>
    [MaxLength(100)]
    public string? Category { get; set; }

    // Navigation
    public ICollection<CarFeature> CarFeatures { get; set; } = new List<CarFeature>();
}

public class CarFeature
{
    [Key]
    public int Id { get; set; }

    public int CarId { get; set; }

    public int FeatureId { get; set; }

    // Navigation
    [ForeignKey(nameof(CarId))]
    public Car Car { get; set; } = null!;

    [ForeignKey(nameof(FeatureId))]
    public Feature Feature { get; set; } = null!;
}
