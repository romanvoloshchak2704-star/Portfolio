namespace ERP.Domain.Entities;

public class Project
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    
    // Нові поля
    public string? GithubUrl { get; set; }
    public string? LiveDemoUrl { get; set; }
    
    // Тепер статус будемо контролювати через константи або просто рядок
    // Варіанти: "В розробці", "Завершено", "Підтримка", "Пауза"
    public string Status { get; set; } = "В розробці"; 

    public List<Skill> RelatedSkills { get; set; } = [];
}