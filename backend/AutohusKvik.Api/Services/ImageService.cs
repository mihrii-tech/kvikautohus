using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace AutohusKvik.Api.Services;

public class ImageService
{
    private readonly IConfiguration _config;
    private readonly ILogger<ImageService> _logger;
    private readonly IWebHostEnvironment _env;

    // Tilladte MIME-typer og filsignaturer (magic bytes)
    private static readonly Dictionary<string, byte[]> AllowedMagicBytes = new()
    {
        { "image/jpeg", new byte[] { 0xFF, 0xD8, 0xFF } },
        { "image/png",  new byte[] { 0x89, 0x50, 0x4E, 0x47 } },
        { "image/webp", new byte[] { 0x52, 0x49, 0x46, 0x46 } }
    };

    public ImageService(IConfiguration config, ILogger<ImageService> logger, IWebHostEnvironment env)
    {
        _config = config;
        _logger = logger;
        _env = env;
    }

    public async Task<ImageUploadResult?> SaveImageAsync(IFormFile file, string subfolder)
    {
        // Valider filstørrelse
        var maxMb = int.Parse(_config["FileUpload:MaxFileSizeMb"] ?? "10");
        if (file.Length > maxMb * 1024 * 1024)
        {
            _logger.LogWarning("Afvist upload: Fil ({Name}) overskrider {Max}MB", file.FileName, maxMb);
            return null;
        }

        // Valider faktisk MIME-type via magic bytes
        using var stream = file.OpenReadStream();
        var magicBytes = new byte[8];
        _ = await stream.ReadAsync(magicBytes.AsMemory(0, 8));
        stream.Seek(0, SeekOrigin.Begin);

        string? detectedMime = null;
        foreach (var (mime, signature) in AllowedMagicBytes)
        {
            if (magicBytes.Take(signature.Length).SequenceEqual(signature))
            {
                detectedMime = mime;
                break;
            }
        }

        if (detectedMime == null)
        {
            _logger.LogWarning("Afvist upload: Ugyldig filtype for {Name}", file.FileName);
            return null;
        }

        // Opret upload-mappe
        var uploadRoot = Path.Combine(_env.WebRootPath, "uploads", subfolder);
        Directory.CreateDirectory(uploadRoot);

        // Unikt filnavn (ingen brugerdata i filnavnet!)
        var uniqueId = Guid.NewGuid().ToString("N");
        var originalFileName = $"{uniqueId}_orig.jpg";
        var webpFileName = $"{uniqueId}.webp";
        var thumbFileName = $"{uniqueId}_thumb.webp";

        var originalPath = Path.Combine(uploadRoot, originalFileName);
        var webpPath = Path.Combine(uploadRoot, webpFileName);
        var thumbPath = Path.Combine(uploadRoot, thumbFileName);

        // Gem og konverter til WebP
        using (var image = await Image.LoadAsync(stream))
        {
            // Full-size WebP (max 1920px bred)
            if (image.Width > 1920)
                image.Mutate(x => x.Resize(1920, 0));

            await image.SaveAsJpegAsync(originalPath);
            await image.SaveAsWebpAsync(webpPath, new WebpEncoder { Quality = 85 });

            // Thumbnail WebP (max 480px bred)
            image.Mutate(x => x.Resize(480, 0));
            await image.SaveAsWebpAsync(thumbPath, new WebpEncoder { Quality = 75 });
        }

        return new ImageUploadResult
        {
            FileName = originalFileName,
            FilePath = $"/uploads/{subfolder}/{originalFileName}",
            WebPPath = $"/uploads/{subfolder}/{webpFileName}",
            ThumbnailPath = $"/uploads/{subfolder}/{thumbFileName}",
            FileSizeBytes = file.Length
        };
    }

    public void DeleteImage(string? filePath)
    {
        if (string.IsNullOrEmpty(filePath)) return;

        var physicalPath = Path.Combine(_env.WebRootPath, filePath.TrimStart('/'));
        if (File.Exists(physicalPath))
        {
            File.Delete(physicalPath);
            _logger.LogInformation("Slettet billedfil: {Path}", physicalPath);
        }
    }

    public void DeleteImageSet(string? filePath, string? webpPath, string? thumbnailPath)
    {
        DeleteImage(filePath);
        DeleteImage(webpPath);
        DeleteImage(thumbnailPath);
    }
}

public class ImageUploadResult
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? WebPPath { get; set; }
    public string? ThumbnailPath { get; set; }
    public long FileSizeBytes { get; set; }
}
