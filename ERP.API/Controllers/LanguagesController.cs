using ERP.API.Attributes;
using ERP.Data;
using ERP.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class LanguagesController : ControllerBase
{
    private readonly AppDbContext _context;
    public LanguagesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Language>>> GetLanguages() 
        => await _context.Languages.ToListAsync();

    [AdminApiKey]
    [HttpPost]
    public async Task<ActionResult<Language>> CreateLanguage(Language language)
    {
        _context.Languages.Add(language);
        await _context.SaveChangesAsync();
        return Ok(language);
    }

    [AdminApiKey]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLanguage(Guid id)
    {
        var lang = await _context.Languages.FindAsync(id);
        if (lang == null) return NotFound();
        _context.Languages.Remove(lang);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}