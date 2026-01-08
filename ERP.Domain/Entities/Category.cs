namespace ERP.Domain.Entities;
using System.ComponentModel.DataAnnotations;

public class Category
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Назва категорії обов'язкова")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    // Зв'язок "Багато до Багатьох" з Навичками
    public List<Skill> Skills { get; set; } = [];
}