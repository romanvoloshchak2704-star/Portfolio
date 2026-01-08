using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ERP.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        // Використовуємо будь-який рядок підключення, він потрібен лише для генерації файлів
        optionsBuilder.UseNpgsql("Host=localhost;Database=dummy;Username=admin;Password=secret");

        return new AppDbContext(optionsBuilder.Options);
    }
}