using System.ComponentModel.DataAnnotations;

namespace AutohusKvik.Api.Models;

public class Service
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ShortDescription { get; set; }

    public string? Content { get; set; }

    public string? Benefits { get; set; } // JSON-array

    public string? Process { get; set; } // JSON-array af trin

    public string? FaqJson { get; set; } // JSON-array af FAQ

    [MaxLength(50)]
    public string? Icon { get; set; }

    [MaxLength(500)]
    public string? ImagePath { get; set; }

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; } = 0;

    [MaxLength(200)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ContentSection
{
    [Key]
    public int Id { get; set; }

    /// <summary>Unik nøgle, fx: hero_title, about_text, trust_points</summary>
    [Required, MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Content { get; set; }

    public bool IsActive { get; set; } = true;

    [MaxLength(200)]
    public string? Page { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Testimonial
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string AuthorName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? AuthorTitle { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public int Rating { get; set; } = 5;

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; } = 0;

    [MaxLength(50)]
    public string? Source { get; set; } // google | manual

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Setting
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    public string? Value { get; set; }

    [MaxLength(200)]
    public string? Description { get; set; }

    /// <summary>text | boolean | number | json | color | image</summary>
    [MaxLength(20)]
    public string Type { get; set; } = "text";

    /// <summary>Gruppe til organisering i admin: branding, contact, email, financing, seo, features</summary>
    [MaxLength(50)]
    public string? Group { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class AuditLog
{
    [Key]
    public int Id { get; set; }

    public int? UserId { get; set; }

    [Required, MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? EntityType { get; set; }

    public int? EntityId { get; set; }

    public string? OldValues { get; set; } // JSON

    public string? NewValues { get; set; } // JSON

    [MaxLength(50)]
    public string? IpAddress { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
}
