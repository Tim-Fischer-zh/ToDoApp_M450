using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models.DTOs;

public class TodoCreateDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public TodoPriority Priority { get; set; } = TodoPriority.Medium;

    public DateTime? DueDate { get; set; }

    public int? CategoryId { get; set; }

    public List<int> TagIds { get; set; } = new();
}

public class TodoUpdateDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public TodoPriority Priority { get; set; } = TodoPriority.Medium;

    public DateTime? DueDate { get; set; }

    public int? CategoryId { get; set; }

    public List<int> TagIds { get; set; } = new();
}
