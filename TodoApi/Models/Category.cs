using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(7)]
    public string Color { get; set; } = "#3B82F6"; // Default blue color

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<TodoItem> TodoItems { get; set; } = new List<TodoItem>();
}
