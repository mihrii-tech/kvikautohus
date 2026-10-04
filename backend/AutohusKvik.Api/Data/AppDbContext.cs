using Microsoft.EntityFrameworkCore;
using AutohusKvik.Api.Models;

namespace AutohusKvik.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<CarImage> CarImages => Set<CarImage>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<CarFeature> CarFeatures => Set<CarFeature>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<TradeInRequest> TradeInRequests => Set<TradeInRequest>();
    public DbSet<TradeInImage> TradeInImages => Set<TradeInImage>();
    public DbSet<WorkshopBooking> WorkshopBookings => Set<WorkshopBooking>();
    public DbSet<WorkshopBookingImage> WorkshopBookingImages => Set<WorkshopBookingImage>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ContentSection> ContentSections => Set<ContentSection>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<Setting> Settings => Set<Setting>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Car: Unikt slug + soft-delete filter
        modelBuilder.Entity<Car>(entity =>
        {
            entity.HasIndex(c => c.Slug).IsUnique();
            entity.HasQueryFilter(c => c.DeletedAt == null);
        });

        // User: Unikt email
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // Service: Unikt slug
        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasIndex(s => s.Slug).IsUnique();
        });

        // Setting: Unik nøgle
        modelBuilder.Entity<Setting>(entity =>
        {
            entity.HasIndex(s => s.Key).IsUnique();
        });

        // ContentSection: Unik nøgle
        modelBuilder.Entity<ContentSection>(entity =>
        {
            entity.HasIndex(cs => cs.Key).IsUnique();
        });

        // Lead: Soft-delete filter
        modelBuilder.Entity<Lead>(entity =>
        {
            entity.HasQueryFilter(l => l.DeletedAt == null);
        });

        // TradeInRequest: Soft-delete filter
        modelBuilder.Entity<TradeInRequest>(entity =>
        {
            entity.HasQueryFilter(t => t.DeletedAt == null);
        });

        // CarFeature: Sammenstillet unik constraint
        modelBuilder.Entity<CarFeature>(entity =>
        {
            entity.HasIndex(cf => new { cf.CarId, cf.FeatureId }).IsUnique();
        });

        // CarImage: Cascade delete ved bil-sletning
        modelBuilder.Entity<CarImage>(entity =>
        {
            entity.HasOne(ci => ci.Car)
                .WithMany(c => c.Images)
                .HasForeignKey(ci => ci.CarId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TradeInImage: Cascade delete
        modelBuilder.Entity<TradeInImage>(entity =>
        {
            entity.HasOne(ti => ti.TradeInRequest)
                .WithMany(t => t.Images)
                .HasForeignKey(ti => ti.TradeInRequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // WorkshopBookingImage: Cascade delete
        modelBuilder.Entity<WorkshopBookingImage>(entity =>
        {
            entity.HasOne(wi => wi.WorkshopBooking)
                .WithMany(wb => wb.Images)
                .HasForeignKey(wi => wi.WorkshopBookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed: Standard services (ydelser)
        modelBuilder.Entity<Service>().HasData(
            new Service { Id = 1, Title = "Serviceeftersyn", Slug = "serviceeftersyn", ShortDescription = "Komplet serviceeftersyn af din bil efter fabrikantens specifikationer.", SortOrder = 1, Icon = "wrench", IsActive = true, CreatedAt = new DateTime(2024, 1, 1), UpdatedAt = new DateTime(2024, 1, 1) },
            new Service { Id = 2, Title = "Reparation og fejlfinding", Slug = "reparation-fejlfinding", ShortDescription = "Diagnostik og reparation af alle bilmærker.", SortOrder = 2, Icon = "search", IsActive = true, CreatedAt = new DateTime(2024, 1, 1), UpdatedAt = new DateTime(2024, 1, 1) },
            new Service { Id = 3, Title = "Skadeservice", Slug = "skadeservice", ShortDescription = "Hjælp ved uheld og forsikringsskader.", SortOrder = 3, Icon = "shield", IsActive = true, CreatedAt = new DateTime(2024, 1, 1), UpdatedAt = new DateTime(2024, 1, 1) },
            new Service { Id = 4, Title = "Synstjek", Slug = "synstjek", ShortDescription = "Forbered din bil til syn og undgå ubehagelige overraskelser.", SortOrder = 4, Icon = "eye", IsActive = true, CreatedAt = new DateTime(2024, 1, 1), UpdatedAt = new DateTime(2024, 1, 1) },
            new Service { Id = 5, Title = "Dækskifte og hjul", Slug = "daekskifte", ShortDescription = "Montage, balancering og opbevaring af dæk.", SortOrder = 5, Icon = "circle", IsActive = true, CreatedAt = new DateTime(2024, 1, 1), UpdatedAt = new DateTime(2024, 1, 1) },
            new Service { Id = 6, Title = "Rudeskift og stenslag", Slug = "rudeskift", ShortDescription = "Professionel rudereparation og -udskiftning.", SortOrder = 6, Icon = "layers", IsActive = true, CreatedAt = new DateTime(2024, 1, 1), UpdatedAt = new DateTime(2024, 1, 1) },
            new Service { Id = 7, Title = "Autohjælp", Slug = "autohjælp", ShortDescription = "Hurtig hjælp ved nedbrud. Ring på nødnummer: +45 50 29 08 74.", SortOrder = 7, Icon = "phone-call", IsActive = true, CreatedAt = new DateTime(2024, 1, 1), UpdatedAt = new DateTime(2024, 1, 1) },
            new Service { Id = 8, Title = "Andre opgaver", Slug = "andre-opgaver", ShortDescription = "Har du en opgave, der ikke er nævnt her? Kontakt os.", SortOrder = 8, Icon = "more-horizontal", IsActive = true, CreatedAt = new DateTime(2024, 1, 1), UpdatedAt = new DateTime(2024, 1, 1) }
        );

        // Seed: Standard indstillinger
        modelBuilder.Entity<Setting>().HasData(
            // Kontakt
            new Setting { Id = 1, Key = "company_name", Value = "Autohus Kvik", Type = "text", Group = "contact", Description = "Virksomhedens navn", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 2, Key = "company_address", Value = "Gammel Køge Landevej 477, 2650 Hvidovre", Type = "text", Group = "contact", Description = "Adresse", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 3, Key = "company_phone", Value = "+45 50 29 08 74", Type = "text", Group = "contact", Description = "Hovednummer", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 4, Key = "company_emergency_phone", Value = "+45 50 29 08 74", Type = "text", Group = "contact", Description = "Nødnummer (autohjælp)", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 5, Key = "company_email", Value = "kontakt@autohusetkvik.dk", Type = "text", Group = "contact", Description = "Kontakte-mail", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 6, Key = "company_cvr", Value = "44047470", Type = "text", Group = "contact", Description = "CVR-nummer", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 7, Key = "opening_hours", Value = "{\"monday\":\"10:00 - 17:00\",\"tuesday\":\"10:00 - 17:00\",\"wednesday\":\"10:00 - 17:00\",\"thursday\":\"10:00 - 17:00\",\"friday\":\"10:00 - 16:00\",\"saturday\":\"Lukket\",\"sunday\":\"12:00 - 16:00\"}", Type = "json", Group = "contact", Description = "Åbningstider", UpdatedAt = new DateTime(2024, 1, 1) },
            // Finansiering
            new Setting { Id = 8, Key = "financing_interest_rate", Value = "6.9", Type = "number", Group = "financing", Description = "Standard debitorrente (% p.a.)", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 9, Key = "financing_establishment_fee", Value = "2000", Type = "number", Group = "financing", Description = "Etableringsgebyr (kr.)", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 10, Key = "financing_monthly_fee", Value = "29", Type = "number", Group = "financing", Description = "Månedligt administrationsgebyr (kr.)", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 11, Key = "financing_disclaimer", Value = "Beregningen er vejledende og udgør ikke et lånetilbud eller en kreditgodkendelse. Endelige vilkår aftales med finansieringspartner.", Type = "text", Group = "financing", Description = "Finansieringsdisclaimer", UpdatedAt = new DateTime(2024, 1, 1) },
            // SEO
            new Setting { Id = 12, Key = "seo_title_suffix", Value = "| Autohus Kvik – Hvidovre", Type = "text", Group = "seo", Description = "Tilføjes til alle sidetitler", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 13, Key = "seo_default_description", Value = "Autohus Kvik i Hvidovre tilbyder brugte biler, bilkøb, byttebiler, finansiering og eget værksted. Ring +45 50 29 08 74.", Type = "text", Group = "seo", Description = "Standard metabeskrivelse", UpdatedAt = new DateTime(2024, 1, 1) },
            // Funktioner (aktiver/deaktiver sektioner)
            new Setting { Id = 14, Key = "show_testimonials", Value = "false", Type = "boolean", Group = "features", Description = "Vis anmeldelsessektion på forsiden", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 15, Key = "google_rating_text", Value = "4,8 stjerner på Google", Type = "text", Group = "features", Description = "Google-vurderingstekst (bekræftes af ejer)", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 16, Key = "show_sold_cars", Value = "true", Type = "boolean", Group = "features", Description = "Vis solgte biler i biloversigten", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 17, Key = "max_image_size_mb", Value = "10", Type = "number", Group = "features", Description = "Maks. billedstørrelse ved upload (MB)", UpdatedAt = new DateTime(2024, 1, 1) },
            // Sociale medier
            new Setting { Id = 18, Key = "social_facebook", Value = "", Type = "text", Group = "social", Description = "Facebook URL", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 19, Key = "social_instagram", Value = "", Type = "text", Group = "social", Description = "Instagram URL", UpdatedAt = new DateTime(2024, 1, 1) },
            // Analytics
            new Setting { Id = 20, Key = "ga4_measurement_id", Value = "", Type = "text", Group = "analytics", Description = "Google Analytics 4 Measurement ID (G-XXXXXXXX)", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 21, Key = "gtm_container_id", Value = "", Type = "text", Group = "analytics", Description = "Google Tag Manager Container ID (GTM-XXXXXXX)", UpdatedAt = new DateTime(2024, 1, 1) },
            // Email
            new Setting { Id = 22, Key = "notification_emails", Value = "kontakt@autohusetkvik.dk", Type = "text", Group = "email", Description = "Modtagere af notifikationer (kommasepareret)", UpdatedAt = new DateTime(2024, 1, 1) },
            // Garanti
            new Setting { Id = 23, Key = "warranty_partner_name", Value = "", Type = "text", Group = "financing", Description = "Garantipartnernavn (fx Cargaranti)", UpdatedAt = new DateTime(2024, 1, 1) },
            new Setting { Id = 24, Key = "warranty_partner_url", Value = "", Type = "text", Group = "financing", Description = "Garantipartner URL", UpdatedAt = new DateTime(2024, 1, 1) }
        );
    }
}
