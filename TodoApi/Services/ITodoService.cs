using TodoApi.Models;

namespace TodoApi.Services;

public interface ITodoService
{
    Task<(IEnumerable<TodoItem> Items, int TotalCount)> GetAllAsync(
        int userId,
        int page = 1,
        int pageSize = 10,
        string? sortBy = "CreatedAt",
        bool sortDescending = true,
        bool? isCompleted = null,
        int? categoryId = null,
        int? tagId = null,
        TodoPriority? priority = null,
        DateTime? dueBefore = null,
        DateTime? dueAfter = null,
        string? searchTerm = null
    );

    Task<TodoItem?> GetByIdAsync(int userId, int id);
    Task<IEnumerable<TodoItem>> SearchByTitleAsync(int userId, string searchTerm);
    Task<TodoItem> CreateAsync(int userId, TodoItem item);
    Task<TodoItem?> UpdateAsync(int userId, int id, TodoItem item);
    Task<bool> DeleteAsync(int userId, int id);
    Task<bool> ToggleCompleteAsync(int userId, int id);
}
