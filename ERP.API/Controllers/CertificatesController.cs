using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Data;
using ERP.Domain.Entities;
using ERP.API.Attributes;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CertificatesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public CertificatesController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Certificate>>> GetCertificates()
    {
        return await _context.Certificates.Include(c => c.Images).ToListAsync();
    }

    [AdminApiKey]
    [HttpPost]
    public async Task<ActionResult<Certificate>> Create(Certificate certificate)
    {
        _context.Certificates.Add(certificate);
        await _context.SaveChangesAsync();
        return Ok(certificate);
    }
    [AdminApiKey]
    [HttpPost("{id}/upload-images")]
    public async Task<IActionResult> UploadImages(Guid id, List<IFormFile> files)
    {
        var certificate = await _context.Certificates.Include(c => c.Images).FirstOrDefaultAsync(c => c.Id == id);
        if (certificate == null) return NotFound();

        var uploadPath = Path.Combine(_env.WebRootPath, "uploads/certificates");
        if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

        foreach (var file in files)
        {
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            certificate.Images.Add(new CertificateImage 
            { 
                ImagePath = $"/uploads/certificates/{fileName}" 
            });
        }

        await _context.SaveChangesAsync();
        return Ok(certificate);
    }
    [AdminApiKey]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var cert = await _context.Certificates.Include(c => c.Images).FirstOrDefaultAsync(c => c.Id == id);
        if (cert == null) return NotFound();

        // Видаляємо фізичні файли
        foreach (var img in cert.Images)
        {
            var fullPath = Path.Combine(_env.WebRootPath, img.ImagePath.TrimStart('/'));
            if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
        }

        _context.Certificates.Remove(cert);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}