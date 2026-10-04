using System.Text.RegularExpressions;

namespace AutohusKvik.Api.Services;

public static class SlugService
{
    private static readonly Dictionary<char, char> DanishChars = new()
    {
        { 'æ', 'a' }, { 'ø', 'o' }, { 'å', 'a' },
        { 'Æ', 'a' }, { 'Ø', 'o' }, { 'Å', 'a' }
    };

    public static string GenerateSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        var slug = input.ToLowerInvariant();

        // Erstat danske bogstaver
        foreach (var (from, to) in DanishChars)
            slug = slug.Replace(from, to);

        // Fjern ugyldige tegn, erstat mellemrum med bindestreg
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');

        return slug;
    }

    public static string GenerateCarSlug(string make, string model, int year, int? mileage = null)
    {
        var parts = new List<string> { make, model, year.ToString() };
        if (mileage.HasValue)
            parts.Add($"{mileage.Value / 1000}tkm");
        return GenerateSlug(string.Join(" ", parts));
    }

    public static string GenerateReferenceNumber(string prefix)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var random = new Random().Next(100, 999);
        return $"{prefix}-{timestamp % 100000}{random}";
    }
}
