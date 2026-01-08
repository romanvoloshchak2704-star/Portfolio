using Microsoft.EntityFrameworkCore;
using ERP.Data;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Налаштування сервісів (DI Container)
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
    );

// 2. Налаштування PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 3. Налаштування CORS (дозволяємо фронтенду звертатися до API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 4. Додаємо Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme {
        Description = "Введіть ваш ключ доступу",
        Name = "X-Admin-Key",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "ApiKey" }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

// --- ПІСЛЯ BUILD: Налаштування конвеєра (Middleware) ---

// 5. Автоматичне застосування міграцій при старті
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// 6. Налаштування Swagger UI
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = string.Empty; // Swagger на головній: http://localhost:5000/
});

// 7. Порядок Middleware дуже важливий:
app.UseStaticFiles();   // Дозволяє роздавати картинки з wwwroot/uploads
app.UseCors("AllowAll"); // Дозволяє запити з React
app.MapControllers();   // Підключає контролери

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
            Console.WriteLine("--> Міграції успішно застосовані.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--> Помилка під час міграції: {ex.Message}");
    }
}

app.Run();