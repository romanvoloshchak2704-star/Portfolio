using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Data;
using ERP.Domain.Entities;
using ERP.API.Attributes;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context) => _context = context;

    // Отримати всі категорії
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories() 
        => await _context.Categories.ToListAsync();

    // Створити нову категорію
    [AdminApiKey]
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    // ВИДАЛЕННЯ КАТЕГОРІЇ
    [AdminApiKey]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        
        if (category == null)
        {
            return NotFound(new { message = "Категорію не знайдено" });
        }

        
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent(); // Повертаємо 204 статус (успішно, без контенту)
    }

    
}