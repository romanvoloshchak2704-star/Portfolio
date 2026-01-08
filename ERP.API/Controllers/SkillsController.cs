using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Data;
using ERP.Domain.Entities;
using ERP.API.Attributes;

namespace ERP.API.Controllers;

// DTO для створення та редагування навички
public class SkillDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PersonalConclusion { get; set; } = string.Empty;
    public List<Guid> CategoryIds { get; set; } = new();
}

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public SkillsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // 1. ОТРИМАТИ ВСІ НАВИЧКИ
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Skill>>> GetSkills()
    {
        return await _context.Skills
            .Include(s => s.Categories) // Важливо для відображення тегів на фронтенді
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    // 2. ОТРИМАТИ ОДНУ НАВИЧКУ
    [HttpGet("{id}")]
    public async Task<ActionResult<Skill>> GetSkill(Guid id)
    {
        var skill = await _context.Skills
            .Include(s => s.Categories)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound();
        return skill;
    }

    // 3. СТВОРИТИ НАВИЧКУ
    [AdminApiKey]
    [HttpPost]
    public async Task<ActionResult<Skill>> CreateSkill(SkillDto dto)
    {
        var skill = new Skill
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            PersonalConclusion = dto.PersonalConclusion,
            ImagePath = "" // Початково пусте, завантажується окремим методом
        };

        // Додаємо зв'язки з категоріями
        if (dto.CategoryIds.Any())
        {
            var categories = await _context.Categories
                .Where(c => dto.CategoryIds.Contains(c.Id))
                .ToListAsync();
            skill.Categories = categories;
        }

        _context.Skills.Add(skill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
    }

    // 4. ОНОВИТИ НАВИЧКУ
    [AdminApiKey]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSkill(Guid id, SkillDto dto)
    {
        // 1. Завантажуємо навичку РАЗОМ із категоріями (Include обов'язковий)
        var skill = await _context.Skills
            .Include(s => s.Categories)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null) return NotFound();

        // 2. Оновлюємо прості поля
        skill.Name = dto.Name;
        skill.Description = dto.Description;
        skill.PersonalConclusion = dto.PersonalConclusion;

        // 3. Оновлюємо категорії
        // Видаляємо ті, яких більше немає в списку DTO
        var categoriesToRemove = skill.Categories
            .Where(c => !dto.CategoryIds.Contains(c.Id))
            .ToList();
        
        foreach (var category in categoriesToRemove)
        {
            skill.Categories.Remove(category);
        }

        // Додаємо ті, які з'явилися в DTO, але яких ще немає в базі для цієї навички
        var currentIds = skill.Categories.Select(c => c.Id).ToList();
        var idsToAdd = dto.CategoryIds.Where(id => !currentIds.Contains(id)).ToList();

        if (idsToAdd.Any())
        {
            var newCategories = await _context.Categories
                .Where(c => idsToAdd.Contains(c.Id))
                .ToListAsync();

            foreach (var category in newCategories)
            {
                skill.Categories.Add(category);
            }
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            // Якщо помилка повториться, ми побачимо деталі в консолі
            return BadRequest($"Помилка бази даних: {ex.InnerException?.Message ?? ex.Message}");
        }

        return NoContent();
    }

    // 5. ЗАВАНТАЖИТИ ЗОБРАЖЕННЯ
    [AdminApiKey]
    [HttpPost("{id}/upload-image")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill == null) return NotFound("Навичку не знайдено");

        if (file == null || file.Length == 0) return BadRequest("Файл не вибрано");

        // Шлях до wwwroot/uploads
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        // Видаляємо старе фото, якщо воно було
        if (!string.IsNullOrEmpty(skill.ImagePath))
        {
            var oldPath = Path.Combine(_env.WebRootPath, skill.ImagePath.TrimStart('/'));
            if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
        }

        // Зберігаємо нове фото
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        skill.ImagePath = $"/uploads/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { path = skill.ImagePath });
    }

    // 6. ВИДАЛИТИ НАВИЧКУ
    [AdminApiKey]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSkill(Guid id)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill == null) return NotFound();

        // Видаляємо файл зображення
        if (!string.IsNullOrEmpty(skill.ImagePath))
        {
            var filePath = Path.Combine(_env.WebRootPath, skill.ImagePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
        }

        _context.Skills.Remove(skill);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}