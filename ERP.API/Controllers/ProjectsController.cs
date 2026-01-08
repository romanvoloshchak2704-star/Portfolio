using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Data;
using ERP.Domain.Entities;
using ERP.API.Attributes;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    // 1. Отримати всі проєкти
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        return await _context.Projects
            .Include(p => p.RelatedSkills)
            .OrderByDescending(p => p.Status == "Завершено") // Сортування: завершені спочатку (опціонально)
            .ToListAsync();
    }

    // 2. Отримати один проєкт за ID
    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetProject(Guid id)
    {
        var project = await _context.Projects
            .Include(p => p.RelatedSkills)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound();
        return project;
    }

    // 3. Створити новий проєкт
    [AdminApiKey]
    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject(Project project)
    {
        // Якщо при створенні передані ID навичок, підтягуємо їх з бази
        if (project.RelatedSkills.Any())
        {
            var skillIds = project.RelatedSkills.Select(s => s.Id).ToList();
            var skills = await _context.Skills.Where(s => skillIds.Contains(s.Id)).ToListAsync();
            project.RelatedSkills = skills;
        }

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    // 4. Оновити існуючий проєкт (Редагування)
    [AdminApiKey]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(Guid id, Project project)
    {
        if (id != project.Id) return BadRequest("ID mismatch");

        var existingProject = await _context.Projects
            .Include(p => p.RelatedSkills)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (existingProject == null) return NotFound();

        // Оновлюємо основні поля
        existingProject.Title = project.Title;
        existingProject.Description = project.Description;
        existingProject.Status = project.Status;
        existingProject.CodeSnippet = project.CodeSnippet;
        existingProject.GithubUrl = project.GithubUrl;
        existingProject.LiveDemoUrl = project.LiveDemoUrl;

        // Логіка оновлення списку навичок
        if (project.RelatedSkills != null)
        {
            existingProject.RelatedSkills.Clear();
            var skillIds = project.RelatedSkills.Select(s => s.Id).ToList();
            var skills = await _context.Skills.Where(s => skillIds.Contains(s.Id)).ToListAsync();
            foreach (var skill in skills)
            {
                existingProject.RelatedSkills.Add(skill);
            }
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProjectExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    // 5. Видалити проєкт
    [AdminApiKey]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // 6. Зв'язати навичку з проєктом (додатковий метод)
    [AdminApiKey]
    [HttpPost("{projectId}/link-skill/{skillId}")]
    public async Task<IActionResult> LinkSkillToProject(Guid projectId, Guid skillId)
    {
        var project = await _context.Projects
            .Include(p => p.RelatedSkills)
            .FirstOrDefaultAsync(p => p.Id == projectId);
        
        var skill = await _context.Skills.FindAsync(skillId);

        if (project == null || skill == null) return NotFound();

        if (!project.RelatedSkills.Any(s => s.Id == skillId))
        {
            project.RelatedSkills.Add(skill);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = $"Проєкт {project.Title} тепер пов'язаний з {skill.Name}" });
    }

    // 7. Відв'язати навичку від проєкту
    [AdminApiKey]
    [HttpDelete("{projectId}/unlink-skill/{skillId}")]
    public async Task<IActionResult> UnlinkSkillFromProject(Guid projectId, Guid skillId)
    {
        var project = await _context.Projects
            .Include(p => p.RelatedSkills)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return NotFound();

        var skill = project.RelatedSkills.FirstOrDefault(s => s.Id == skillId);
        if (skill != null)
        {
            project.RelatedSkills.Remove(skill);
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    private bool ProjectExists(Guid id)
    {
        return _context.Projects.Any(e => e.Id == id);
    }
}