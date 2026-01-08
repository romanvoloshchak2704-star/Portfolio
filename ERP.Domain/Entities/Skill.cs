namespace ERP.Domain.Entities;
using System.ComponentModel.DataAnnotations;

public class Skill
{
    public Guid Id { get; set; }
    
    [Required(ErrorMessage = "Назва навички обов'язкова")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    [System.ComponentModel.DataAnnotations.Schema.Column(TypeName = "text")] 
    public string Description { get; set; } = string.Empty;
    public string PersonalConclusion { get; set; } = string.Empty; // Твій висновок
    public string? ImagePath { get; set; } // Шлях до скріна

    public List<Category> Categories { get; set; } = [];
    public List<Project> Projects { get; set; } = [];
}