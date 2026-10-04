using AutohusKvik.Api.Data;
using AutohusKvik.Api.Models;
using AutohusKvik.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutohusKvik.Api.Controllers;

// ─────────────────────────────────────────────────────
// OFFENTLIG: Hent biler
// ─────────────────────────────────────────────────────
[ApiController]
[Route("api/cars")]
public class CarsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CarsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetCars(
        [FromQuery] string? make,
        [FromQuery] string? model,
        [FromQuery] string? fuelType,
        [FromQuery] string? transmission,
        [FromQuery] string? bodyType,
        [FromQuery] string? color,
        [FromQuery] string? status,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? minYear,
        [FromQuery] int? maxYear,
        [FromQuery] int? minMileage,
        [FromQuery] int? maxMileage,
        [FromQuery] bool? isFeatured,
        [FromQuery] string? search,
        [FromQuery] string sort = "newest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var query = _db.Cars
            .Include(c => c.Images.OrderBy(i => i.SortOrder))
            .Where(c => c.Status != "draft" && c.Status != "archived");

        // Vis solgte biler kun hvis settings tillader det
        var showSold = (await _db.Settings.FirstOrDefaultAsync(s => s.Key == "show_sold_cars"))?.Value != "false";
        if (!showSold)
            query = query.Where(c => c.Status != "sold");

        // Filtre
        if (!string.IsNullOrEmpty(make)) query = query.Where(c => c.Make == make);
        if (!string.IsNullOrEmpty(model)) query = query.Where(c => c.Model == model);
        if (!string.IsNullOrEmpty(fuelType)) query = query.Where(c => c.FuelType == fuelType);
        if (!string.IsNullOrEmpty(transmission)) query = query.Where(c => c.Transmission == transmission);
        if (!string.IsNullOrEmpty(bodyType)) query = query.Where(c => c.BodyType == bodyType);
        if (!string.IsNullOrEmpty(color)) query = query.Where(c => c.Color == color);
        if (!string.IsNullOrEmpty(status)) query = query.Where(c => c.Status == status);
        if (minPrice.HasValue) query = query.Where(c => c.Price >= minPrice.Value);
        if (maxPrice.HasValue) query = query.Where(c => c.Price <= maxPrice.Value);
        if (minYear.HasValue) query = query.Where(c => c.Year >= minYear.Value);
        if (maxYear.HasValue) query = query.Where(c => c.Year <= maxYear.Value);
        if (minMileage.HasValue) query = query.Where(c => c.Mileage >= minMileage.Value);
        if (maxMileage.HasValue) query = query.Where(c => c.Mileage <= maxMileage.Value);
        if (isFeatured.HasValue) query = query.Where(c => c.IsFeatured == isFeatured.Value);

        // Fritekst-søgning
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(s) ||
                c.Make.ToLower().Contains(s) ||
                c.Model.ToLower().Contains(s) ||
                (c.Variant != null && c.Variant.ToLower().Contains(s)) ||
                (c.Description != null && c.Description.ToLower().Contains(s)));
        }

        // Sortering
        query = sort switch
        {
            "price_asc" => query.OrderBy(c => c.Price),
            "price_desc" => query.OrderByDescending(c => c.Price),
            "year_desc" => query.OrderByDescending(c => c.Year),
            "year_asc" => query.OrderBy(c => c.Year),
            "mileage_asc" => query.OrderBy(c => c.Mileage),
            _ => query.OrderByDescending(c => c.PublishedAt ?? c.CreatedAt)
        };

        var total = await query.CountAsync();
        var cars = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Slug,
                c.Make,
                c.Model,
                c.Variant,
                c.Year,
                c.Mileage,
                c.FuelType,
                c.Transmission,
                c.BodyType,
                c.Color,
                c.Price,
                c.MonthlyPayment,
                c.Status,
                c.IsFeatured,
                c.IsNew,
                c.Badge,
                c.PublishedAt,
                CoverImage = c.Images.OrderBy(i => i.SortOrder).FirstOrDefault() != null
                    ? new { c.Images.OrderBy(i => i.SortOrder).First().ThumbnailPath, c.Images.OrderBy(i => i.SortOrder).First().WebPPath, c.Images.OrderBy(i => i.SortOrder).First().AltText }
                    : null
            })
            .ToListAsync();

        return Ok(new
        {
            cars,
            total,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)total / pageSize)
        });
    }

    [HttpGet("filters")]
    public async Task<IActionResult> GetFilterOptions()
    {
        var query = _db.Cars.Where(c => c.Status != "draft" && c.Status != "archived");
        return Ok(new
        {
            makes = await query.Select(c => c.Make).Distinct().OrderBy(m => m).ToListAsync(),
            models = await query.Select(c => c.Model).Distinct().OrderBy(m => m).ToListAsync(),
            fuelTypes = await query.Where(c => c.FuelType != null).Select(c => c.FuelType!).Distinct().OrderBy(f => f).ToListAsync(),
            transmissions = await query.Where(c => c.Transmission != null).Select(c => c.Transmission!).Distinct().ToListAsync(),
            bodyTypes = await query.Where(c => c.BodyType != null).Select(c => c.BodyType!).Distinct().ToListAsync(),
            colors = await query.Where(c => c.Color != null).Select(c => c.Color!).Distinct().OrderBy(c => c).ToListAsync(),
            minPrice = await query.MinAsync(c => (decimal?)c.Price) ?? 0,
            maxPrice = await query.MaxAsync(c => (decimal?)c.Price) ?? 0,
            minYear = await query.MinAsync(c => (int?)c.Year) ?? 0,
            maxYear = await query.MaxAsync(c => (int?)c.Year) ?? 0
        });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetCar(string slug)
    {
        var car = await _db.Cars
            .Include(c => c.Images.OrderBy(i => i.SortOrder))
            .Include(c => c.CarFeatures)
                .ThenInclude(cf => cf.Feature)
            .FirstOrDefaultAsync(c => c.Slug == slug && c.Status != "draft" && c.Status != "archived");

        if (car == null) return NotFound(new { message = "Bilen blev ikke fundet." });

        // Relaterede biler
        var related = await _db.Cars
            .Include(c => c.Images.OrderBy(i => i.SortOrder).Take(1))
            .Where(c => c.Make == car.Make && c.Id != car.Id && c.Status == "for_sale")
            .Take(4)
            .Select(c => new { c.Id, c.Title, c.Slug, c.Make, c.Model, c.Year, c.Price, c.Mileage, c.FuelType, c.Status,
                CoverImage = c.Images.FirstOrDefault() != null ? c.Images.First().ThumbnailPath : null })
            .ToListAsync();

        return Ok(new
        {
            car.Id, car.Title, car.Slug, car.Make, car.Model, car.Variant, car.Year, car.ModelYear,
            car.BodyType, car.Color, car.ColorHex, car.FuelType, car.Transmission, car.Mileage,
            car.Horsepower, car.EngineSize, car.FuelConsumption, car.ElectricRange,
            car.Co2Emission, car.GreenTax, car.NumDoors, car.NumSeats, car.DriveType,
            car.FirstRegistration, car.Price, car.MonthlyPayment, car.DownPayment,
            car.LoanTermMonths, car.InterestRate, car.Status, car.IsFeatured, car.IsNew, car.Badge,
            car.HasWarranty, car.WarrantyDetails, car.IsPrepared, car.HasServiceHistory, car.IsInspected,
            car.Description, car.FinancingInfo, car.WarrantyInfo, car.TradeInInfo,
            car.MetaTitle, car.MetaDescription, car.PublishedAt, car.CreatedAt,
            Images = car.Images.Select(i => new { i.Id, i.FilePath, i.WebPPath, i.ThumbnailPath, i.AltText, i.SortOrder }),
            Features = car.CarFeatures
                .GroupBy(cf => cf.Feature.Category ?? "Udstyr")
                .Select(g => new { Category = g.Key, Items = g.Select(cf => cf.Feature.Name) }),
            RelatedCars = related
        });
    }
}

// ─────────────────────────────────────────────────────
// ADMIN: Administrer biler (kræver JWT)
// ─────────────────────────────────────────────────────
[ApiController]
[Route("api/admin/cars")]
[Authorize(Policy = "AdminOnly")]
public class AdminCarsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ImageService _imageService;
    private readonly AuditLogService _audit;
    private readonly ILogger<AdminCarsController> _logger;

    public AdminCarsController(AppDbContext db, ImageService imageService, AuditLogService audit, ILogger<AdminCarsController> logger)
    {
        _db = db;
        _imageService = imageService;
        _audit = audit;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Cars
            .IgnoreQueryFilters() // Admin ser alle inkl. slettede
            .Where(c => c.DeletedAt == null)
            .Include(c => c.Images.OrderBy(i => i.SortOrder).Take(1))
            .AsQueryable();

        if (!string.IsNullOrEmpty(status)) query = query.Where(c => c.Status == status);

        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(s) ||
                c.Make.ToLower().Contains(s) ||
                c.Model.ToLower().Contains(s) ||
                (c.Variant != null && c.Variant.ToLower().Contains(s)));
        }

        var total = await query.CountAsync();
        var cars = await query
            .OrderByDescending(c => c.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.Id, c.Title, c.Slug, c.Make, c.Model, c.Variant, c.Year, c.Price,
                c.Mileage, c.FuelType, c.Status, c.IsFeatured, c.IsNew, c.Badge,
                c.CreatedAt, c.UpdatedAt, c.PublishedAt,
                CoverThumbnail = c.Images.FirstOrDefault() != null ? c.Images.First().ThumbnailPath : null
            })
            .ToListAsync();

        return Ok(new { cars, total, page, pageSize, totalPages = (int)Math.Ceiling((double)total / pageSize) });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var car = await _db.Cars
            .IgnoreQueryFilters()
            .Include(c => c.Images.OrderBy(i => i.SortOrder))
            .Include(c => c.CarFeatures).ThenInclude(cf => cf.Feature)
            .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);

        if (car == null) return NotFound(new { message = "Bil ikke fundet." });
        return Ok(car);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCarRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Generer slug
        var baseSlug = SlugService.GenerateCarSlug(request.Make, request.Model, request.Year);
        var slug = baseSlug;
        var counter = 1;
        while (await _db.Cars.IgnoreQueryFilters().AnyAsync(c => c.Slug == slug))
            slug = $"{baseSlug}-{counter++}";

        var car = new Car
        {
            Title = request.Title,
            Slug = slug,
            Make = request.Make,
            Model = request.Model,
            Variant = request.Variant,
            Year = request.Year,
            BodyType = request.BodyType,
            Color = request.Color,
            ColorHex = request.ColorHex,
            FuelType = request.FuelType,
            Transmission = request.Transmission,
            Mileage = request.Mileage,
            Horsepower = request.Horsepower,
            EngineSize = request.EngineSize,
            FuelConsumption = request.FuelConsumption,
            ElectricRange = request.ElectricRange,
            Co2Emission = request.Co2Emission,
            GreenTax = request.GreenTax,
            NumDoors = request.NumDoors,
            NumSeats = request.NumSeats,
            DriveType = request.DriveType,
            FirstRegistration = request.FirstRegistration,
            ModelYear = request.ModelYear,
            Price = request.Price,
            MonthlyPayment = request.MonthlyPayment,
            Status = request.Status ?? "draft",
            IsFeatured = request.IsFeatured,
            IsNew = request.IsNew,
            Badge = request.Badge,
            HasWarranty = request.HasWarranty,
            WarrantyDetails = request.WarrantyDetails,
            IsPrepared = request.IsPrepared,
            HasServiceHistory = request.HasServiceHistory,
            IsInspected = request.IsInspected,
            Description = request.Description,
            FinancingInfo = request.FinancingInfo,
            WarrantyInfo = request.WarrantyInfo,
            TradeInInfo = request.TradeInInfo,
            Vin = request.Vin,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            PublishedAt = request.Status == "for_sale" ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Cars.Add(car);
        await _db.SaveChangesAsync();

        // Tilføj udstyr
        if (request.FeatureIds?.Any() == true)
        {
            foreach (var featureId in request.FeatureIds)
                _db.CarFeatures.Add(new CarFeature { CarId = car.Id, FeatureId = featureId });
            await _db.SaveChangesAsync();
        }

        await _audit.LogAsync("car_created", "Car", car.Id,
            newValues: $"{{\"title\":\"{car.Title}\",\"status\":\"{car.Status}\"}}",
            userId: AuditLogService.GetUserId(User),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return CreatedAtAction(nameof(GetById), new { id = car.Id }, new { car.Id, car.Slug, car.Title });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCarRequest request)
    {
        var car = await _db.Cars.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);
        if (car == null) return NotFound(new { message = "Bil ikke fundet." });

        car.Title = request.Title;
        car.Make = request.Make;
        car.Model = request.Model;
        car.Variant = request.Variant;
        car.Year = request.Year;
        car.BodyType = request.BodyType;
        car.Color = request.Color;
        car.ColorHex = request.ColorHex;
        car.FuelType = request.FuelType;
        car.Transmission = request.Transmission;
        car.Mileage = request.Mileage;
        car.Horsepower = request.Horsepower;
        car.EngineSize = request.EngineSize;
        car.FuelConsumption = request.FuelConsumption;
        car.ElectricRange = request.ElectricRange;
        car.Co2Emission = request.Co2Emission;
        car.GreenTax = request.GreenTax;
        car.NumDoors = request.NumDoors;
        car.NumSeats = request.NumSeats;
        car.DriveType = request.DriveType;
        car.FirstRegistration = request.FirstRegistration;
        car.ModelYear = request.ModelYear;
        car.Price = request.Price;
        car.MonthlyPayment = request.MonthlyPayment;
        car.IsFeatured = request.IsFeatured;
        car.IsNew = request.IsNew;
        car.Badge = request.Badge;
        car.HasWarranty = request.HasWarranty;
        car.WarrantyDetails = request.WarrantyDetails;
        car.IsPrepared = request.IsPrepared;
        car.HasServiceHistory = request.HasServiceHistory;
        car.IsInspected = request.IsInspected;
        car.Description = request.Description;
        car.FinancingInfo = request.FinancingInfo;
        car.WarrantyInfo = request.WarrantyInfo;
        car.TradeInInfo = request.TradeInInfo;
        car.Vin = request.Vin;
        car.MetaTitle = request.MetaTitle;
        car.MetaDescription = request.MetaDescription;

        // Status-ændring
        if (car.Status != request.Status)
        {
            car.Status = request.Status ?? "draft";
            if (car.Status == "for_sale" && car.PublishedAt == null)
                car.PublishedAt = DateTime.UtcNow;
        }

        // Opdater udstyr
        if (request.FeatureIds != null)
        {
            var existing = await _db.CarFeatures.Where(cf => cf.CarId == id).ToListAsync();
            _db.CarFeatures.RemoveRange(existing);
            foreach (var fId in request.FeatureIds)
                _db.CarFeatures.Add(new CarFeature { CarId = id, FeatureId = fId });
        }

        car.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("car_updated", "Car", car.Id,
            newValues: $"{{\"status\":\"{car.Status}\"}}",
            userId: AuditLogService.GetUserId(User));

        return Ok(new { car.Id, car.Slug, car.Status });
    }

    [HttpPost("{id:int}/images")]
    public async Task<IActionResult> UploadImages(int id, IFormFileCollection files)
    {
        var car = await _db.Cars.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);
        if (car == null) return NotFound(new { message = "Bil ikke fundet." });

        var maxSort = await _db.CarImages.Where(i => i.CarId == id).MaxAsync(i => (int?)i.SortOrder) ?? -1;
        var results = new List<object>();

        foreach (var file in files)
        {
            var result = await _imageService.SaveImageAsync(file, $"cars/{id}");
            if (result == null)
            {
                results.Add(new { fileName = file.FileName, success = false, error = "Ugyldig filtype eller for stor fil." });
                continue;
            }

            var image = new CarImage
            {
                CarId = id,
                FileName = result.FileName,
                FilePath = result.FilePath,
                WebPPath = result.WebPPath,
                ThumbnailPath = result.ThumbnailPath,
                AltText = $"{car.Make} {car.Model} {car.Year}",
                SortOrder = ++maxSort,
                FileSizeBytes = result.FileSizeBytes
            };
            _db.CarImages.Add(image);
            results.Add(new { image.Id, image.FilePath, image.WebPPath, image.ThumbnailPath, image.SortOrder, success = true });
        }

        await _db.SaveChangesAsync();
        return Ok(results);
    }

    [HttpDelete("{id:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteImage(int id, int imageId)
    {
        var image = await _db.CarImages.FirstOrDefaultAsync(i => i.Id == imageId && i.CarId == id);
        if (image == null) return NotFound(new { message = "Billede ikke fundet." });

        _imageService.DeleteImageSet(image.FilePath, image.WebPPath, image.ThumbnailPath);
        _db.CarImages.Remove(image);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Billede slettet." });
    }

    [HttpPut("{id:int}/images/reorder")]
    public async Task<IActionResult> ReorderImages(int id, [FromBody] List<ImageSortItem> items)
    {
        var images = await _db.CarImages.Where(i => i.CarId == id).ToListAsync();
        foreach (var item in items)
        {
            var img = images.FirstOrDefault(i => i.Id == item.Id);
            if (img != null) img.SortOrder = item.SortOrder;
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Rækkefølge gemt." });
    }

    [HttpPost("{id:int}/duplicate")]
    public async Task<IActionResult> Duplicate(int id)
    {
        var original = await _db.Cars.IgnoreQueryFilters()
            .Include(c => c.CarFeatures)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (original == null) return NotFound();

        var copy = new Car
        {
            Title = $"{original.Title} (kopi)",
            Slug = SlugService.GenerateSlug($"{original.Slug}-kopi-{DateTime.UtcNow.Ticks}"),
            Make = original.Make, Model = original.Model, Variant = original.Variant,
            Year = original.Year, BodyType = original.BodyType, Color = original.Color,
            FuelType = original.FuelType, Transmission = original.Transmission,
            Mileage = original.Mileage, Horsepower = original.Horsepower,
            Price = original.Price, Status = "draft",
            Description = original.Description, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };

        _db.Cars.Add(copy);
        await _db.SaveChangesAsync();

        foreach (var cf in original.CarFeatures)
            _db.CarFeatures.Add(new CarFeature { CarId = copy.Id, FeatureId = cf.FeatureId });
        await _db.SaveChangesAsync();

        return Ok(new { copy.Id, copy.Slug, copy.Title, message = "Bil duplikeret som kladde." });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var car = await _db.Cars.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);
        if (car == null) return NotFound();

        car.DeletedAt = DateTime.UtcNow;
        car.Status = "archived";
        car.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("car_deleted", "Car", car.Id,
            oldValues: $"{{\"title\":\"{car.Title}\"}}",
            userId: AuditLogService.GetUserId(User));

        return Ok(new { message = "Bil arkiveret og fjernet fra hjemmesiden." });
    }
}

public class CreateCarRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public string Title { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    public string Make { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    public string Model { get; set; } = string.Empty;
    public string? Variant { get; set; }
    [System.ComponentModel.DataAnnotations.Required]
    public int Year { get; set; }
    public string? BodyType { get; set; }
    public string? Color { get; set; }
    public string? ColorHex { get; set; }
    public string? FuelType { get; set; }
    public string? Transmission { get; set; }
    public int? Mileage { get; set; }
    public int? Horsepower { get; set; }
    public string? EngineSize { get; set; }
    public decimal? FuelConsumption { get; set; }
    public decimal? ElectricRange { get; set; }
    public decimal? Co2Emission { get; set; }
    public decimal? GreenTax { get; set; }
    public int? NumDoors { get; set; }
    public int? NumSeats { get; set; }
    public string? DriveType { get; set; }
    public DateTime? FirstRegistration { get; set; }
    public int? ModelYear { get; set; }
    [System.ComponentModel.DataAnnotations.Required]
    public decimal Price { get; set; }
    public decimal? MonthlyPayment { get; set; }
    public string? Status { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsNew { get; set; }
    public string? Badge { get; set; }
    public bool HasWarranty { get; set; }
    public string? WarrantyDetails { get; set; }
    public bool IsPrepared { get; set; }
    public bool HasServiceHistory { get; set; }
    public bool IsInspected { get; set; }
    public string? Description { get; set; }
    public string? FinancingInfo { get; set; }
    public string? WarrantyInfo { get; set; }
    public string? TradeInInfo { get; set; }
    public string? Vin { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public List<int>? FeatureIds { get; set; }
}

public class ImageSortItem
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
}
