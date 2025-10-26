using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class TodoItem
{
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public TodoPriority Priority { get; set; } = TodoPriority.Medium;

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    // Foreign Keys
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    // Navigation properties
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}

public enum TodoPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3
}
