using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class Tag
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;

    [StringLength(7)]
    public string Color { get; set; } = "#6B7280"; // Default gray color

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<TodoItem> TodoItems { get; set; } = new List<TodoItem>();
}
