using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AutohusKvik.Api.Services;

/// <summary>
/// Service til opslag i Synsbasen API (https://api.synsbasen.dk/v1).
/// API-nøglen læses udelukkende fra serverens miljøvariabel SYNSBASEN_API_KEY.
/// 
/// Endpoints:
///   GET /v1/vehicles/registration/:registration
///   GET /v1/vehicles/vin/:vin
/// </summary>
public class SynsbasenService
{
    private const string BaseUrl = "https://api.synsbasen.dk/v1";

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<SynsbasenService> _logger;

    public SynsbasenService(HttpClient httpClient, IConfiguration config, ILogger<SynsbasenService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Slå køretøj op via dansk nummerplade.
    /// Kalder: GET /v1/vehicles/registration/{registration}
    /// </summary>
    public async Task<VehicleLookupResult?> LookupByRegistrationAsync(string registration)
    {
        var cleanReg = registration.Replace(" ", "").Replace("-", "").ToUpper().Trim();
        return await CallSynsbasenAsync($"{BaseUrl}/vehicles/registration/{cleanReg}", $"registrering {cleanReg}");
    }

    /// <summary>
    /// Slå køretøj op via stelnummer (VIN).
    /// Kalder: GET /v1/vehicles/vin/{vin}
    /// </summary>
    public async Task<VehicleLookupResult?> LookupByVinAsync(string vin)
    {
        var cleanVin = vin.Replace(" ", "").ToUpper().Trim();
        return await CallSynsbasenAsync($"{BaseUrl}/vehicles/vin/{cleanVin}", $"VIN {cleanVin}");
    }

    /// <summary>
    /// Fælles metode der kalder Synsbasen API med Bearer-token og parser resultatet.
    /// </summary>
    private async Task<VehicleLookupResult?> CallSynsbasenAsync(string url, string lookupDescription)
    {
        var apiKey = Environment.GetEnvironmentVariable("SYNSBASEN_API_KEY")
            ?? _config["SYNSBASEN_API_KEY"]
            ?? _config["Synsbasen:ApiKey"]
            ?? _config["Synsbasen__ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.StartsWith("${") || apiKey.Contains("your_synsbasen_api_key"))
        {
            _logger.LogInformation("Synsbasen API-nøgle er ikke konfigureret eller er en placeholder for {Lookup}. Fortsætter uden eksternt API.", lookupDescription);
            return null;
        }

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey.Trim());
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        try
        {
            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Synsbasen API returnerede {StatusCode} for {Lookup}: {Body}",
                    (int)response.StatusCode, lookupDescription, errorBody);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            return ParseResponse(json);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "HTTP-fejl ved opslag i Synsbasen for {Lookup}", lookupDescription);
            return null;
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(ex, "Timeout ved opslag i Synsbasen for {Lookup}", lookupDescription);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Uventet fejl ved opslag i Synsbasen for {Lookup}", lookupDescription);
            return null;
        }
    }

    /// <summary>
    /// Parser Synsbasen JSON-svar og mapper til et renset VehicleLookupResult.
    /// Rå API-data sendes aldrig videre til frontend.
    /// </summary>
    private VehicleLookupResult? ParseResponse(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // Synsbasen kan returnere data direkte, i "data"-property, eller som array
            JsonElement vehicleData;
            if (root.TryGetProperty("data", out var dataElement))
            {
                if (dataElement.ValueKind == JsonValueKind.Array)
                {
                    if (dataElement.GetArrayLength() == 0) return null;
                    vehicleData = dataElement[0];
                }
                else
                {
                    vehicleData = dataElement;
                }
            }
            else if (root.ValueKind == JsonValueKind.Array)
            {
                if (root.GetArrayLength() == 0) return null;
                vehicleData = root[0];
            }
            else
            {
                vehicleData = root;
            }

            var brandAndModel = GetStringValue(vehicleData, "brand_and_model");
            var make = GetStringValue(vehicleData, "brand", "make", "maerke");
            var model = GetStringValue(vehicleData, "model");

            if (string.IsNullOrEmpty(make) && !string.IsNullOrEmpty(brandAndModel))
            {
                var parts = brandAndModel.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length > 0) make = parts[0];
                if (string.IsNullOrEmpty(model) && parts.Length > 1) model = parts[1];
            }

            // Synsrapport PDF link fra shallow inspections
            string? inspectionPdf = null;
            if (vehicleData.TryGetProperty("inspections", out var inspectionsEl) && inspectionsEl.ValueKind == JsonValueKind.Array && inspectionsEl.GetArrayLength() > 0)
            {
                inspectionPdf = GetStringValue(inspectionsEl[0], "pdf");
            }

            // Farve fra rod eller nested body-objekt
            var color = GetStringValue(vehicleData, "color", "farve");
            if (string.IsNullOrEmpty(color) && vehicleData.TryGetProperty("body", out var bodyEl) && bodyEl.ValueKind == JsonValueKind.Object)
            {
                color = GetStringValue(bodyEl, "color", "farve");
            }

            // Hestekræfter fra rod eller nested engine-objekt
            var horsepower = GetIntValue(vehicleData, "horsepower", "hp", "hk");
            if (horsepower == null && vehicleData.TryGetProperty("engine", out var engineEl) && engineEl.ValueKind == JsonValueKind.Object)
            {
                horsepower = GetIntValue(engineEl, "horsepower", "hp", "hk");
                if (horsepower == null)
                {
                    var kw = GetDoubleValue(engineEl, "engine_power");
                    if (kw.HasValue) horsepower = (int)Math.Round(kw.Value * 1.36);
                }
            }

            var result = new VehicleLookupResult
            {
                Found = true,
                Make = make,
                Model = model,
                Variant = GetStringValue(vehicleData, "variant", "version"),
                FirstRegistrationDate = GetStringValue(vehicleData, "first_registration_date", "first_registration", "foerste_registrering"),
                FuelType = GetStringValue(vehicleData, "fuel_type", "fuel", "braendstof"),
                RegistrationNumber = GetStringValue(vehicleData, "registration", "registration_number", "registreringsnummer"),
                Vin = GetStringValue(vehicleData, "vin", "stelnummer"),
                Status = GetStringValue(vehicleData, "status", "registration_status"),
                Color = color,
                LastInspectionDate = GetStringValue(vehicleData, "last_inspection_date", "last_inspection", "seneste_syn"),
                LastInspectionResult = GetStringValue(vehicleData, "last_inspection_result", "inspection_result", "synsresultat"),
                NextInspectionDate = GetStringValue(vehicleData, "next_inspection_date_estimate", "next_inspection_date", "next_inspection", "naeste_syn"),
                Mileage = GetIntValue(vehicleData, "mileage", "km_stand", "kilometerstand"),
                Year = GetIntValue(vehicleData, "model_year", "year", "aargang"),
                BodyType = GetStringValue(vehicleData, "body_type", "kind", "category", "type", "karosseri"),
                EngineSize = GetStringValue(vehicleData, "engine_size", "motor"),
                Horsepower = horsepower,
                TotalWeight = GetIntValue(vehicleData, "total_weight", "technical_total_weight", "totalvaegt"),
                CurbWeight = GetIntValue(vehicleData, "curb_weight", "vehicle_weight", "egenvaegt"),
                InspectionPdfUrl = inspectionPdf,
            };

            // Udtræk årstal fra FirstRegistrationDate, hvis Year ikke er sat
            if (result.Year == null && !string.IsNullOrEmpty(result.FirstRegistrationDate))
            {
                if (DateTime.TryParse(result.FirstRegistrationDate, out var dt))
                    result.Year = dt.Year;
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Kunne ikke parse Synsbasen-svar");
            return null;
        }
    }

    private static string? GetStringValue(JsonElement element, params string[] propertyNames)
    {
        foreach (var name in propertyNames)
        {
            if (element.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.String)
                return prop.GetString();
        }
        return null;
    }

    private static int? GetIntValue(JsonElement element, params string[] propertyNames)
    {
        foreach (var name in propertyNames)
        {
            if (element.TryGetProperty(name, out var prop))
            {
                if (prop.ValueKind == JsonValueKind.Number && prop.TryGetInt32(out var val))
                    return val;
                if (prop.ValueKind == JsonValueKind.String && int.TryParse(prop.GetString(), out var parsed))
                    return parsed;
            }
        }
        return null;
    }

    private static double? GetDoubleValue(JsonElement element, params string[] propertyNames)
    {
        foreach (var name in propertyNames)
        {
            if (element.TryGetProperty(name, out var prop))
            {
                if (prop.ValueKind == JsonValueKind.Number && prop.TryGetDouble(out var val))
                    return val;
                if (prop.ValueKind == JsonValueKind.String && double.TryParse(prop.GetString(), out var parsed))
                    return parsed;
            }
        }
        return null;
    }
}

/// <summary>
/// Renset resultat-DTO – aldrig rå API-data til frontend.
/// </summary>
public class VehicleLookupResult
{
    public bool Found { get; set; } = true;
    public string? Message { get; set; }
    public string? Make { get; set; }
    public string? Model { get; set; }
    public string? Variant { get; set; }
    public int? Year { get; set; }
    public string? FirstRegistrationDate { get; set; }
    public string? FuelType { get; set; }
    public int? Mileage { get; set; }
    public string? LastInspectionDate { get; set; }
    public string? LastInspectionResult { get; set; }
    public string? NextInspectionDate { get; set; }
    public string? Status { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? Vin { get; set; }
    public string? Color { get; set; }
    public string? BodyType { get; set; }
    public string? EngineSize { get; set; }
    public int? Horsepower { get; set; }
    public int? TotalWeight { get; set; }
    public int? CurbWeight { get; set; }
    public string? InspectionPdfUrl { get; set; }
}
