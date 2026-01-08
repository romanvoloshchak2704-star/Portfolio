namespace ERP.Domain.Entities;

public class Certificate
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty; // Хто видав (Udemy, Microsoft, і т.д.)
    public DateTime? IssueDate { get; set; }
    
    // Список зображень
    public List<CertificateImage> Images { get; set; } = new();
}

public class CertificateImage
{
    public Guid Id { get; set; }
    public string ImagePath { get; set; } = string.Empty;
    public Guid CertificateId { get; set; }
}