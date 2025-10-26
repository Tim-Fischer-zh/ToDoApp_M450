using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models.DTOs;

public class CategoryCreateDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(7)]
    public string Color { get; set; } = "#3B82F6";
}

public class CategoryUpdateDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(7)]
    public string Color { get; set; } = "#3B82F6";
}
