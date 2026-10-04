using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutohusKvik.Api.Models;

public class CarImage
{
    [Key]
    public int Id { get; set; }

    public int CarId { get; set; }

    [Required, MaxLength(500)]
    public string FileName { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? WebPPath { get; set; }

    [MaxLength(500)]
    public string? ThumbnailPath { get; set; }

    /// <summary>Alt-tekst til tilgængelighed og SEO</summary>
    [MaxLength(500)]
    public string? AltText { get; set; }

    /// <summary>Sorteringsrækkefølge – første billede = forsidebillede</summary>
    public int SortOrder { get; set; } = 0;

    public long FileSizeBytes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CarId))]
    public Car Car { get; set; } = null!;
}
