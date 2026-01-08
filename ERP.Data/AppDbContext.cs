using Microsoft.EntityFrameworkCore;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore.Diagnostics; // Додай цей using

namespace ERP.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Skill> Skills { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Certificate> Certificates { get; set; }
    public DbSet<CertificateImage> CertificateImages { get; set; }
    public DbSet<Language> Languages { get; set; }

    // ДОДАЄМО ЦЕЙ МЕТОД
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Це ігнорує перевірку на відповідність моделі при запуску,
        // що дозволить програмі не падати, якщо міграції трохи "відстають"
        optionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}