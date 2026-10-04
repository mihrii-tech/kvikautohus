using AutohusKvik.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AutohusKvik.Api.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        // 1. Seed Admin Bruger hvis ingen findes
        if (!context.Users.Any())
        {
            var admin = new User
            {
                Name = "Autohus Kvik Admin",
                Email = "admin@autohusetkvik.dk",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234!"),
                Role = "owner",
                IsActive = true,
                Phone = "+45 50 29 08 74",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(admin);
            context.SaveChanges();
        }

        // 2. Seed Testimonials hvis ingen findes
        if (!context.Testimonials.Any())
        {
            context.Testimonials.AddRange(
                new Testimonial
                {
                    AuthorName = "Lars Møller",
                    AuthorTitle = "Købte Volvo S40",
                    Content = "Fantastisk service fra start til slut! Bilen var klargjort til perfektion, og de hjalp med en rigtig god finansieringsløsning.",
                    Rating = 5,
                    IsActive = true,
                    SortOrder = 1,
                    Source = "Google"
                },
                new Testimonial
                {
                    AuthorName = "Mette & Christian",
                    AuthorTitle = "Byttede bil & værkstedskunde",
                    Content = "Vi fik en super fair byttepris for vores gamle bil og kørte hjem i en fin nyere bil. Deres eget værksted giver en enorm tryghed.",
                    Rating = 5,
                    IsActive = true,
                    SortOrder = 2,
                    Source = "Trustpilot"
                },
                new Testimonial
                {
                    AuthorName = "Rasmus Hvid",
                    AuthorTitle = "Serviceeftersyn kunde",
                    Content = "Har brugt Autohus Kviks værksted til service og synstjek. Ærlige priser og bilen var klar før aftalt tid. Kan varmt anbefales!",
                    Rating = 5,
                    IsActive = true,
                    SortOrder = 3,
                    Source = "Google"
                }
            );
            context.SaveChanges();
        }

        // 3. Seed Biler fra DBA
        var existingCars = context.Cars.Include(c => c.Images).ToList();
        var isDbaSeeded = existingCars.Any(c => c.Make == "Land Rover") && !existingCars.Any(c => c.Description != null && c.Description.Contains("&#x1f4cd;"));
        if (!isDbaSeeded)
        {
            if (existingCars.Any())
            {
                context.Cars.RemoveRange(existingCars);
                context.SaveChanges();
            }

            var cars = new List<Car>
            {
                new Car
                {
                    Title = "Volvo S40",
                    Slug = "volvo-s40-1-6-4d-2003-1",
                    Make = "Volvo",
                    Model = "S40",
                    Variant = "1,6   4D",
                    Year = 2003,
                    Price = 18900m,
                    Mileage = 135000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Sedan",
                    NumDoors = 4,
                    DriveType = "Forhjulstræk",
                    Horsepower = 109,
                    Vin = "YV1VS10K34F040338",
                    Status = "for_sale",
                    IsFeatured = true,
                    IsNew = false,
                    Badge = "FREMHÆVET",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"VOLVO S40 – 2003 | KUN 135.000 KM | DEN KLASSISKE “EVIGHEDSMASKINE”

Her får du en klassisk Volvo S40 fra 2003, som kun har kørt 135.000 km.

Bilen starter og kører perfekt og fremstår rigtig pæn og velholdt i forhold til sin alder. Også rustmæssigt står bilen pænt taget årgangen i betragtning.

Volvo fra denne generation er kendt for sin solide konstruktion og driftssikkerhed – en rigtig “evighedsmaskine”, når den bliver passet ordentligt.

Bilen har cirka 1 år til næste syn og kan efter aftale leveres nysynet og nyserviceret mod merpris.

UDSTYR &amp; INFO:
• Servostyring
• ABS-bremser
• Airbags
• Centrallås
• El-ruder
• El-spejle
• Justerbart rat
• Højdejusterbart førersæde
• Kopholdere
• Radio
• 12V-stik
• 4 Michelin helårsdæk
• 2 nøgler med fjernbetjening
• Kun 135.000 km
• Ca. 1 år til næste syn

En solid og velkørende Volvo med lavt kilometertal, der stadig har masser af kilometer tilbage i sig.

&#x1f527; Kan leveres nysynet og nyserviceret mod merpris.

📞 Kontakt os for yderligere information eller for at aftale en fremvisning.

Autohuset Kvik
📍 Gammel Køge Landevej 477, Hvidovre
&#x1f527; Eget værksted",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/01.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/01.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/02.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/02.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/03.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/03.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/04.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/04.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/05.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/05.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/06.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/06.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/07.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/07.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/08.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/08.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/09.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/09.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/10.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/10.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/11.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/11.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/12.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/12.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/12.jpg", SortOrder = 12 },
                        new CarImage { FilePath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/13.jpg", WebPPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/13.jpg", ThumbnailPath = "/uploads/cars/volvo-s40-1-6-4d-2003-1/13.jpg", SortOrder = 13 },
                    }
                },
                new Car
                {
                    Title = "Renault Clio IV",
                    Slug = "renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2",
                    Make = "Renault",
                    Model = "Clio IV",
                    Variant = "0,9 TCe 90 Dynamique Sport Tourer  5D",
                    Year = 2014,
                    Price = 29900m,
                    Mileage = 203000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Stationcar",
                    NumDoors = 5,
                    DriveType = "Forhjulstræk",
                    Horsepower = 90,
                    Vin = "VF17RLA0H51414538",
                    Status = "for_sale",
                    IsFeatured = true,
                    IsNew = false,
                    Badge = "FREMHÆVET",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"BEMÆRK: Bilen er i øjeblikket under klargøring. Nye billeder vil blive tilføjet snarest.

Renault Clio – 2014 | 203.000 km | Nysynet &amp; nyserviceret

Flot og velkørende Renault Clio fra 2014. Bilen har kørt 203.000 km og starter og kører rigtig godt. Den leveres nysynet og nyserviceret, så den er klar til sin nye ejer.

Bilen står på helårsdæk og har en rigtig fin udstyrspakke.

✅ Årgang: 2014
✅ Kilometer: 203.000 km
✅ Leveres nysynet
✅ Leveres nyserviceret
✅ Cruise control / fartpilot
✅ Sædevarme foran
✅ Regnsensor
✅ El-ruder foran
✅ Læderrat
✅ Kørecomputer
✅ Tågeforlygter
✅ Højdejusterbart førersæde
✅ Fjernbetjent/elektronisk startspærre
✅ ESP
✅ ABS / BAS / EBD
✅ Isofix
✅ 12V stik i midterkonsol
✅ Splitbagsæde 60/40
✅ Airbags
✅ Nakkestøtter ved alle sæder

En økonomisk og praktisk bil, der egner sig rigtig godt til både bykørsel og længere ture.

📍 Autohuset Kvik
Gammel Køge Landevej 477
2650 Hvidovre

&#x1f527; Vi har eget værksted og sørger for, at bilen leveres nysynet og nyserviceret.

&#x1f698; Byttebil tages gerne i bytte.

&#x1f4e9; Kontakt os for fremvisning eller prøvekørsel.",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/01.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/01.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/02.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/02.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/03.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/03.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/04.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/04.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/05.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/05.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/06.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/06.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/07.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/07.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/08.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/08.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/09.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/09.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/10.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/10.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/11.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/11.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/12.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/12.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/12.jpg", SortOrder = 12 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/13.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/13.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/13.jpg", SortOrder = 13 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/14.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/14.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/14.jpg", SortOrder = 14 },
                        new CarImage { FilePath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/15.jpg", WebPPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/15.jpg", ThumbnailPath = "/uploads/cars/renault-clio-iv-0-9-tce-90-dynamique-sport-tourer-5d-2014-2/15.jpg", SortOrder = 15 },
                    }
                },
                new Car
                {
                    Title = "Suzuki Alto",
                    Slug = "suzuki-alto-1-0-comfort-5d-2010-3",
                    Make = "Suzuki",
                    Model = "Alto",
                    Variant = "1,0 Comfort  5D",
                    Year = 2010,
                    Price = 24900m,
                    Mileage = 120000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Hatchback 5-dørs",
                    NumDoors = 5,
                    DriveType = "Forhjulstræk",
                    Horsepower = 68,
                    Vin = "MA3GFC31S00277198",
                    Status = "for_sale",
                    IsFeatured = true,
                    IsNew = false,
                    Badge = "FREMHÆVET",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"Suzuki Alto – 2010 – 120.000 km – Benzin/Gas

Pæn og økonomisk Suzuki Alto fra 2010, som kun har kørt 120.000 km. Bilen starter og kører godt og er en rigtig god og billig hverdagsbil.

⭐ KAN KØRE PÅ BÅDE BENZIN OG GAS ⭐

Bilen er udstyret med gasanlæg og kan derfor køre på både benzin og gas. Det giver mulighed for at holde brændstofudgifterne nede – især med de høje benzinpriser.

UDSTYR:

✓ Aircondition
✓ El-ruder
✓ Centrallås
✓ Servostyring
✓ Radio/CD
✓ ABS-bremser
✓ Airbags
✓ ISOFIX
✓ Justerbart rat
✓ Splitbagsæde
✓ Startspærre

VED LEVERING:

✓ Leveres nysynet
✓ Leveres nyserviceret
✓ Kun kørt 120.000 km
✓ Benzin + gas

En oplagt bil til dig, der søger en billig, økonomisk og praktisk bil til hverdagen.

📍 Autohuset Kvik – Hvidovre
&#x1f527; Eget værksted

Kontakt os for fremvisning og prøvekørsel.",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/01.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/01.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/02.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/02.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/03.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/03.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/04.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/04.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/05.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/05.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/06.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/06.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/07.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/07.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/08.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/08.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/09.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/09.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/10.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/10.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/11.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/11.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/12.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/12.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/12.jpg", SortOrder = 12 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/13.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/13.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2010-3/13.jpg", SortOrder = 13 },
                    }
                },
                new Car
                {
                    Title = "Nissan Micra",
                    Slug = "nissan-micra-1-2-acenta-5d-2011-4",
                    Make = "Nissan",
                    Model = "Micra",
                    Variant = "1,2 Acenta  5D",
                    Year = 2011,
                    Price = 24900m,
                    Mileage = 162000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Hatchback 5-dørs",
                    NumDoors = 5,
                    DriveType = "Forhjulstræk",
                    Horsepower = 80,
                    Vin = "MDHFBUK13U0510556",
                    Status = "for_sale",
                    IsFeatured = true,
                    IsNew = false,
                    Badge = "TILBUD",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"Nissan Micra 1.2 – 2012 | Kun 162.000 km | Nysynet &amp; nyserviceret!

Flot og velholdt Nissan Micra fra 2012 med kun 162.000 km på tælleren. Bilen er nysynet og nyserviceret, så den er helt klar til sin nye ejer. En økonomisk, driftssikker og billig bil i hverdagen – perfekt som pendlerbil eller førstegangsbil.

Udstyr:
✅ ABS-bremser
✅ Fjernbetjent centrallås
✅ El-ruder for
✅ El-justerbare og el-opvarmede sidespejle
✅ Højdejusterbart førersæde
✅ Justerbart rat
✅ Radio/CD-afspiller
✅ ISOFIX
✅ Halogenforlygter med højdejustering
✅ Stænkklapper
✅ Startspærre

&#x1f527; Nysynet
&#x1f527; Nyserviceret

📍 Autohusetkvik – Bilhandel &amp; Værksted
📞 50 29 08 74

Åbningstider:
&#x1f559; Man–Tors: 10:00 – 17:00
&#x1f559; Fredag: 10:00 – 15:00
❌ Lørdag: Lukket
&#x1f55b; Søndag: 12:00 – 16:00

📞 Ring eller skriv for pris, fremvisning eller en prøvetur.",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/01.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/01.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/02.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/02.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/03.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/03.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/04.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/04.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/05.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/05.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/06.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/06.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/07.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/07.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/08.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/08.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/09.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/09.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/10.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/10.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/11.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/11.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/12.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/12.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/12.jpg", SortOrder = 12 },
                        new CarImage { FilePath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/13.jpg", WebPPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/13.jpg", ThumbnailPath = "/uploads/cars/nissan-micra-1-2-acenta-5d-2011-4/13.jpg", SortOrder = 13 },
                    }
                },
                new Car
                {
                    Title = "Citroën C1",
                    Slug = "citroen-c1-1-0i-attraction-5d-2012-5",
                    Make = "Citroen",
                    Model = "C1",
                    Variant = "1,0i Attraction  5D",
                    Year = 2012,
                    Price = 28900m,
                    Mileage = 125000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Hatchback 5-dørs",
                    NumDoors = 5,
                    DriveType = "Forhjulstræk",
                    Horsepower = 68,
                    Vin = "VF7PNCFB4CR513082",
                    Status = "for_sale",
                    IsFeatured = false,
                    IsNew = false,
                    Badge = "BRUGT BIL",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"Citroën C1 | 125.000 km | Ny kobling | Leveres nysynet &amp; nyserviceret

Fin og økonomisk Citroën C1 med kun 125.000 km på tælleren.

Bilen er i øjeblikket under klargøring, og der kommer derfor nye billeder op snarest.

Bilen har netop fået ny kobling og leveres selvfølgelig nysynet og nyserviceret, så den er klar til sin nye ejer.

✅ Kun kørt 125.000 km
✅ Ny kobling
✅ Leveres nysynet
✅ Leveres nyserviceret
✅ Økonomisk i drift
✅ Billig at holde kørende
✅ Perfekt som bybil eller førstegangsbil
✅ Nem at parkere

&#x1f527; Bilen er under klargøring – nye billeder kommer snart!

📍 Autohuset Kvik
Gammel Køge Landevej 477
2650 Hvidovre

&#x1f527; Eget værksted

&#x1f698; Byttebil tages gerne i bytte.

&#x1f4e9; Kontakt os allerede nu for mere information, fremvisning eller reservation.",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/01.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/01.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/02.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/02.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/03.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/03.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/04.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/04.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/05.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/05.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/06.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/06.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/07.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/07.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/08.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/08.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/09.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/09.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/10.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/10.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/11.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/11.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/12.jpg", WebPPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/12.jpg", ThumbnailPath = "/uploads/cars/citroen-c1-1-0i-attraction-5d-2012-5/12.jpg", SortOrder = 12 },
                    }
                },
                new Car
                {
                    Title = "BMW 420d",
                    Slug = "bmw-420d-2-0-gran-coup-aut-5d-2016-6",
                    Make = "BMW",
                    Model = "420d",
                    Variant = "2,0 Gran Coupé aut.  5D",
                    Year = 2016,
                    Price = 142500m,
                    Mileage = 227000,
                    FuelType = "Diesel",
                    Transmission = "Automatisk",
                    BodyType = "Hatchback 5-dørs",
                    NumDoors = 5,
                    DriveType = "Baghjulstræk",
                    Horsepower = 190,
                    Vin = "WBA4E910XGG595637",
                    Status = "for_sale",
                    IsFeatured = false,
                    IsNew = false,
                    Badge = "BRUGT BIL",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"BMW 420d – 2017 227.000 km  Automatgear 

Flot og velholdt BMW 420d fra 2017 med den stærke og økonomiske dieselmotor samt 8-trins Steptronic automatgear.

Bilen har kørt 227.000 km og er blevet passet og plejet med service for hver ca. 15.000 km. Den starter og kører rigtig godt og byder på masser af komfort og lækkert udstyr.

Udstyr

✅ 8-trins Steptronic automatgear
✅ Mineral White metallak
✅ M læderrat
✅ Eftermonteret Apple CarPlay
✅ Eftermonteret bakkamera
✅ Bluetooth
✅ USB-interface
✅ Xenon-forlygter
✅ Automatisk klimaanlæg
✅ Sædevarme foran
✅ Regnsensor
✅ Automatisk bagklap
✅ Dæktryksovervågning
✅ Runflat-dæk
✅ Forlygtevaskeanlæg
✅ Forskydeligt armlæn foran
✅ 12V-stik
✅ Deaktivering af passagerairbag
✅ Låsebolte
✅ Cold-climate version
✅ ISOFIX
✅ Kørecomputer
✅ Multifunktionsrat

Passet og serviceret

Bilen er passet godt og har fået service for hver ca. 15.000 km. Den kører rigtig godt og er en komfortabel og økonomisk BMW, der er perfekt til både hverdagskørsel og længere ture.

FORMIDLINGSSALG

Bilen sælges som formidlingssalg.

📞 Ring for en aftale inden fremvisning.

&#x1f6e1;️ Bilen kan leveres med 12 måneders garanti for 8.995 kr.

Autohuset Kvik
📍 Gammel Køge Landevej 477, Hvidovre
&#x1f527; Eget værksted",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/01.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/01.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/02.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/02.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/03.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/03.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/04.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/04.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/05.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/05.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/06.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/06.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/07.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/07.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/08.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/08.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/09.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/09.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/10.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/10.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/11.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/11.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/12.jpg", WebPPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/12.jpg", ThumbnailPath = "/uploads/cars/bmw-420d-2-0-gran-coup-aut-5d-2016-6/12.jpg", SortOrder = 12 },
                    }
                },
                new Car
                {
                    Title = "Suzuki Alto",
                    Slug = "suzuki-alto-1-0-comfort-5d-2009-7",
                    Make = "Suzuki",
                    Model = "Alto",
                    Variant = "1,0 Comfort  5D",
                    Year = 2009,
                    Price = 16900m,
                    Mileage = 211000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Hatchback 5-dørs",
                    NumDoors = 5,
                    DriveType = "Forhjulstræk",
                    Horsepower = 68,
                    Vin = "MA3GFC31S00128306",
                    Status = "for_sale",
                    IsFeatured = false,
                    IsNew = false,
                    Badge = "TILBUD",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"SUZUKI ALTO – 2009 | 211.000 KM | NYSYNET &amp; NYSERVICERET

Fin og økonomisk Suzuki Alto fra 2009, som har kørt 211.000 km. En praktisk og billig bil, der er perfekt som bybil, pendlerbil eller førstegangsbil.

Bilen starter og kører fint og leveres klar til den nye ejer.

✅ Årgang 2009
✅ Kørt 211.000 km
✅ Leveres nysynet
✅ Leveres nyserviceret
✅ Benzin
✅ Økonomisk i drift
✅ Billig at holde kørende
✅ Praktisk og nem at parkere

&#x1f527; EGET VÆRKSTED
Vi har eget værksted, hvor vores biler bliver serviceret og klargjort.

📍 Autohuset Kvik
Gammel Køge Landevej 477
2650 Hvidovre",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/01.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/01.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/02.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/02.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/03.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/03.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/04.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/04.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/05.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/05.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/06.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/06.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/07.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/07.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/08.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/08.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/09.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/09.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/10.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/10.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/11.jpg", WebPPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/11.jpg", ThumbnailPath = "/uploads/cars/suzuki-alto-1-0-comfort-5d-2009-7/11.jpg", SortOrder = 11 },
                    }
                },
                new Car
                {
                    Title = "Land Rover Range Rover Sport",
                    Slug = "land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8",
                    Make = "Land Rover",
                    Model = "Range Rover Sport",
                    Variant = "2,7 TDV6 SE aut.  5D",
                    Year = 2005,
                    Price = 35900m,
                    Mileage = 294000,
                    FuelType = "Diesel",
                    Transmission = "Automatisk",
                    BodyType = "Kassevogn",
                    NumDoors = 5,
                    DriveType = "Firehjulstræk",
                    Horsepower = 190,
                    Vin = "SALLSAA146A927038",
                    Status = "for_sale",
                    IsFeatured = false,
                    IsNew = false,
                    Badge = "BRUGT BIL",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"RANGE ROVER SPORT – 2005 | 294.000 KM

Flot og rummelig Range Rover Sport fra 2005. Bilen starter og kører fint og byder på masser af komfort og god plads.

✅ Årgang: 2005
✅ Kilometer: 294.000 km
✅ Automatgear
✅ Ny tandstang
✅ 4 helt nye dæk
✅ Læderkabine
✅ Klimaanlæg / Aircondition
✅ El-ruder
✅ El-spejle
✅ Fartpilot
✅ Multifunktionsrat
✅ Alufælge
✅ Centrallås

&#x1f527; Bilen er ikke synet.

Bilen har nogle ridser og almindelige brugsspor rundt omkring, hvilket må forventes af en bil fra 2005. Ellers fremstår den fint i forhold til alder og kilometer.

Der er netop investeret i bilen med ny tandstang samt 4 nye dæk.

📍 Autohuset Kvik – Hvidovre",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/01.jpg", WebPPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/01.jpg", ThumbnailPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/02.jpg", WebPPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/02.jpg", ThumbnailPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/03.jpg", WebPPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/03.jpg", ThumbnailPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/04.jpg", WebPPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/04.jpg", ThumbnailPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/05.jpg", WebPPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/05.jpg", ThumbnailPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/06.jpg", WebPPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/06.jpg", ThumbnailPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/07.jpg", WebPPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/07.jpg", ThumbnailPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/08.jpg", WebPPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/08.jpg", ThumbnailPath = "/uploads/cars/land-rover-range-rover-sport-2-7-tdv6-se-aut-5d-2005-8/08.jpg", SortOrder = 8 },
                    }
                },
                new Car
                {
                    Title = "Fiat 500",
                    Slug = "fiat-500-1-2-pop-3d-2008-9",
                    Make = "Fiat",
                    Model = "500",
                    Variant = "1,2 Pop  3D",
                    Year = 2008,
                    Price = 29900m,
                    Mileage = 209000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Hatchback 3-dørs",
                    NumDoors = 3,
                    DriveType = "Forhjulstræk",
                    Horsepower = 69,
                    Vin = "ZFA31200000862214",
                    Status = "for_sale",
                    IsFeatured = false,
                    IsNew = false,
                    Badge = "BRUGT BIL",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"Fiat 500 – 209.000 km

Smart og økonomisk Fiat 500 med fin servicehistorik. Bilen er nysynet, nyserviceret og har fået ny kobling samt nyt leje i gearkassen. Den starter og kører rigtig godt og er klar til mange problemfrie kilometer.

✅ Nysynet
✅ Nyserviceret
✅ Fin servicehistorik
✅ Ny kobling
✅ Nyt leje i gearkassen
✅ El-betjente sidespejle
✅ El-ruder for
✅ Fjernbetjent centrallås
✅ Splitbagsæde
✅ Elektrisk servostyring med City-funktion
✅ Start &amp; Stop
✅ Tripcomputer
✅ Højdejusterbart førersæde
✅ Højdejusterbart rat

&#x1f697; Velholdt bil med lave driftsomkostninger og god økonomi. Perfekt som pendlerbil, bybil eller førstegangsbil.

📍 Autohuset Kvik
&#x1f527; Eget værksted
&#x1f697; Vi tager gerne din nuværende bil i bytte

Kontakt os for fremvisning eller prøvekørsel.",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/01.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/01.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/02.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/02.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/03.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/03.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/04.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/04.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/05.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/05.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/06.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/06.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/07.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/07.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/08.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/08.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/09.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/09.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/10.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/10.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/11.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/11.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/12.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/12.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/12.jpg", SortOrder = 12 },
                        new CarImage { FilePath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/13.jpg", WebPPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/13.jpg", ThumbnailPath = "/uploads/cars/fiat-500-1-2-pop-3d-2008-9/13.jpg", SortOrder = 13 },
                    }
                },
                new Car
                {
                    Title = "Peugeot 208",
                    Slug = "peugeot-208-1-6-e-hdi-92-active-5d-2012-10",
                    Make = "Peugeot",
                    Model = "208",
                    Variant = "1,6 e-HDi 92 Active  5D",
                    Year = 2012,
                    Price = 29900m,
                    Mileage = 231000,
                    FuelType = "Diesel",
                    Transmission = "Manuelt",
                    BodyType = "Hatchback 5-dørs",
                    NumDoors = 5,
                    DriveType = "Forhjulstræk",
                    Horsepower = 92,
                    Vin = "VF3CC8HR0DT105356",
                    Status = "for_sale",
                    IsFeatured = false,
                    IsNew = false,
                    Badge = "TILBUD",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"Peugeot 208 1.6 HDi – 2014 • Op til 30,3 km/l • Kun 520kr. halvårlig ejerafgift!

Flot og velkørende Peugeot 208 med den driftssikre 1.6 HDi dieselmotor. En komfortabel og økonomisk bil, som er perfekt til både pendling og længere ture. Med et brændstofforbrug på op til 30,3 km/l og en halvårlig ejerafgift på kun 520kr. får du en bil med meget lave driftsomkostninger.

✅ Årgang: 2014
✅ Km: 231.000
✅ 1.6HDi Diesel
✅ Op til 30,3 km/l
✅ Kun 520 kr. halvårlig ejerafgift
✅ Tandrem skiftet ved 191.000 km
✅ Leveres nysynet og nyserviceret
✅ Billig i drift
✅ Finansiering med eller uden udbetaling
✅ Vi tager gerne din gamle bil i bytte

Udstyr bl.a.:
Aircondition, el-ruder, fjernbetjent centrallås, fartpilot, kørecomputer, Bluetooth, AUX/USB-tilslutning, radio/CD, højdejusterbart førersæde, splitbagsæde, Isofix, servostyring, ESP og airbags.

En rummelig, komfortabel og meget økonomisk dieselbil, der kører rigtig godt og er klar til mange flere kilometer.

📍 Autohuset Kvik
Gammel Køge Landevej 477, 2650 Hvidovre
📞 50 29 08 74

Åbningstider:
Man-Tors: 10:00 - 17:00
Fre: 10:00 - 15:00
Lør: Lukket
Søn: 12:00 - 16:00",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/01.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/01.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/02.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/02.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/03.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/03.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/04.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/04.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/05.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/05.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/06.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/06.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/07.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/07.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/08.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/08.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/09.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/09.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/10.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/10.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/11.jpg", WebPPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/11.jpg", ThumbnailPath = "/uploads/cars/peugeot-208-1-6-e-hdi-92-active-5d-2012-10/11.jpg", SortOrder = 11 },
                    }
                },
                new Car
                {
                    Title = "Skoda Fabia",
                    Slug = "skoda-fabia-1-2-6v-classic-5d-2008-11",
                    Make = "Skoda",
                    Model = "Fabia",
                    Variant = "1,2 6V Classic  5D",
                    Year = 2008,
                    Price = 16900m,
                    Mileage = 161000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Hatchback 5-dørs",
                    NumDoors = 5,
                    DriveType = "Forhjulstræk",
                    Horsepower = 60,
                    Vin = "TMBFH65J983204555",
                    Status = "for_sale",
                    IsFeatured = false,
                    IsNew = false,
                    Badge = "BRUGT BIL",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"Skoda Fabia – 2008 • Praktisk og økonomisk hverdagsbil!

Velkørende og rummelig Skoda Fabia som starter og kører godt. En driftssikker bil med god plads og lave driftsomkostninger – perfekt som pendlerbil, førstegangsbil eller ekstra bil i familien.

✅ Årgang: 2008
✅ Km: 161.000
✅ Leveres nysynet og nyserviceret
✅ Billig i drift og ejerafgift
✅ God komfort og masser af plads
✅ Finansiering med eller uden udbetaling
✅ Vi tager gerne din gamle bil i bytte

Udstyr bl.a.:
el-ruder, centrallås, servostyring, kørecomputer, højdejusterbart rat, AUX-tilslutning, Radio/CD, Isofix, splitbagsæde, airbags samt ESP.

En solid og økonomisk bil der er klar til mange flere kilometer.

📍 Autohuset Kvik
Gammel Køge Landevej 477, 2650 Hvidovre
📞 +45 50290874

Åbningstider:
Man-Tors: 10:00 - 17:00
Fre: 10:00 - 15:00
Lør: Lukket
Søn: 12:00 - 16:00

Kære kunder


I denne periode vil Autohuset Kvik være lukket. Vi er tilbage og klar til at hjælpe jer igen fra 16. juli.

Alle henvendelser skal ske via e-mail i ferieperioden, og vi besvarer dem hurtigst muligt.

Vi ønsker alle vores kunder en rigtig god sommer!

Med venlig hilsen
Autohuset Kvik",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/01.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/01.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/02.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/02.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/03.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/03.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/04.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/04.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/05.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/05.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/06.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/06.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/07.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/07.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/08.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/08.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/09.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/09.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/10.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/10.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/11.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/11.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/12.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/12.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/12.jpg", SortOrder = 12 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/13.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/13.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/13.jpg", SortOrder = 13 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/14.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/14.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/14.jpg", SortOrder = 14 },
                        new CarImage { FilePath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/15.jpg", WebPPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/15.jpg", ThumbnailPath = "/uploads/cars/skoda-fabia-1-2-6v-classic-5d-2008-11/15.jpg", SortOrder = 15 },
                    }
                },
                new Car
                {
                    Title = "Kia Picanto",
                    Slug = "kia-picanto-1-0-attraction-5d-2016-12",
                    Make = "Kia",
                    Model = "Picanto",
                    Variant = "1,0 Attraction  5D",
                    Year = 2016,
                    Price = 39900m,
                    Mileage = 147000,
                    FuelType = "Benzin",
                    Transmission = "Manuelt",
                    BodyType = "Hatchback 5-dørs",
                    NumDoors = 5,
                    DriveType = "Forhjulstræk",
                    Horsepower = 69,
                    Vin = "KNABX511AGT253658",
                    Status = "for_sale",
                    IsFeatured = false,
                    IsNew = false,
                    Badge = "BRUGT BIL",
                    HasWarranty = true,
                    WarrantyDetails = "Mulighed for 12/24 mdr. garanti og nysynet levering efter aftale.",
                    IsPrepared = true,
                    HasServiceHistory = true,
                    IsInspected = true,
                    Description = @"Kia Picanto – 2016 • Økonomisk og velholdt med bakkamera!

Flot og økonomisk Kia Picanto som kører rigtig godt. Perfekt som bybil, pendlerbil eller førstegangsbil med lave driftsomkostninger og god komfort.

✅ Årgang: 2016
✅ Km: 147.000
✅ nysynet og nyserviceret
✅ Lav ejerafgift
✅ 2 nøgler
✅ Finansiering med eller uden udbetaling
✅ Vi tager gerne din gamle bil i bytte
✅ Ny kobling 
Udstyr bl.a.:
Bakkamera, aircondition, el-ruder, fjernbetjent centrallås, sædevarme, kørecomputer, Isofix, AUX/USB, Radio/CD, servostyring, ESP, antispin, startspærre og airbags.

En driftssikker og billig bil i drift – klar til mange flere kilometer.

📍 Autohuset Kvik
Gammel Køge Landevej 477, 2650 Hvidovre
📞 +45 50290874

Åbningstider:
Man-Tors: 10:00 - 17:00
Fre: 10:00 - 15:00
Lør: Lukket
Søn: 12:00 - 16:00",
                    Images = new List<CarImage>
                    {
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/01.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/01.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/01.jpg", SortOrder = 1 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/02.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/02.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/02.jpg", SortOrder = 2 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/03.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/03.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/03.jpg", SortOrder = 3 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/04.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/04.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/04.jpg", SortOrder = 4 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/05.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/05.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/05.jpg", SortOrder = 5 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/06.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/06.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/06.jpg", SortOrder = 6 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/07.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/07.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/07.jpg", SortOrder = 7 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/08.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/08.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/08.jpg", SortOrder = 8 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/09.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/09.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/09.jpg", SortOrder = 9 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/10.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/10.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/10.jpg", SortOrder = 10 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/11.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/11.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/11.jpg", SortOrder = 11 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/12.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/12.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/12.jpg", SortOrder = 12 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/13.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/13.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/13.jpg", SortOrder = 13 },
                        new CarImage { FilePath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/14.jpg", WebPPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/14.jpg", ThumbnailPath = "/uploads/cars/kia-picanto-1-0-attraction-5d-2016-12/14.jpg", SortOrder = 14 },
                    }
                },
            };

            context.Cars.AddRange(cars);
            context.SaveChanges();
        }
    }
}
