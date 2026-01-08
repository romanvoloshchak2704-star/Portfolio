namespace ERP.Domain.Entities;

public class Language
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty; // Напр: "Англійська"
    public string Level { get; set; } = string.Empty; // Напр: "B2 - Upper Intermediate"
}