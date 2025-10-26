using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<TodoItem> TodoItems { get; set; } = new List<TodoItem>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
}
