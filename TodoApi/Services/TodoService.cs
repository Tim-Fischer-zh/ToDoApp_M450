using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Services;

public class TodoService : ITodoService
{
    private readonly TodoDbContext _context;

    public TodoService(TodoDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<TodoItem> Items, int TotalCount)> GetAllAsync(
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
        string? searchTerm = null)
    {
        var query = _context.TodoItems
            .Include(t => t.Category)
            .Include(t => t.Tags)
            .Where(t => t.UserId == userId);

        // Apply filters
        if (isCompleted.HasValue)
            query = query.Where(t => t.IsCompleted == isCompleted.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        if (tagId.HasValue)
            query = query.Where(t => t.Tags.Any(tag => tag.Id == tagId.Value));

        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        if (dueBefore.HasValue)
            query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value <= dueBefore.Value);

        if (dueAfter.HasValue)
            query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value >= dueAfter.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(t => t.Title.Contains(searchTerm) || (t.Description != null && t.Description.Contains(searchTerm)));

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "title" => sortDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            "priority" => sortDescending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            "duedate" => sortDescending ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
            "iscompleted" => sortDescending ? query.OrderByDescending(t => t.IsCompleted) : query.OrderBy(t => t.IsCompleted),
            _ => sortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt)
        };

        // Apply pagination
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<TodoItem?> GetByIdAsync(int userId, int id)
    {
        return await _context.TodoItems
            .Include(t => t.Category)
            .Include(t => t.Tags)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    }

    public async Task<IEnumerable<TodoItem>> SearchByTitleAsync(int userId, string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return await _context.TodoItems
                .Include(t => t.Category)
                .Include(t => t.Tags)
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        return await _context.TodoItems
            .Include(t => t.Category)
            .Include(t => t.Tags)
            .Where(t => t.UserId == userId && t.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
            .ToListAsync();
    }

    public async Task<TodoItem> CreateAsync(int userId, TodoItem item)
    {
        item.UserId = userId;
        item.CreatedAt = DateTime.UtcNow;

        // Handle tags
        if (item.Tags != null && item.Tags.Any())
        {
            var tagIds = item.Tags.Select(t => t.Id).ToList();
            item.Tags = await _context.Tags.Where(t => tagIds.Contains(t.Id)).ToListAsync();
        }

        _context.TodoItems.Add(item);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(userId, item.Id) ?? item;
    }

    public async Task<TodoItem?> UpdateAsync(int userId, int id, TodoItem item)
    {
        var existingTodo = await _context.TodoItems
            .Include(t => t.Tags)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (existingTodo == null)
            return null;

        existingTodo.Title = item.Title;
        existingTodo.Description = item.Description;
        existingTodo.IsCompleted = item.IsCompleted;
        existingTodo.Priority = item.Priority;
        existingTodo.DueDate = item.DueDate;
        existingTodo.CategoryId = item.CategoryId;

        if (item.IsCompleted && !existingTodo.CompletedAt.HasValue)
        {
            existingTodo.CompletedAt = DateTime.UtcNow;
        }
        else if (!item.IsCompleted)
        {
            existingTodo.CompletedAt = null;
        }

        // Update tags
        if (item.Tags != null)
        {
            existingTodo.Tags.Clear();
            var tagIds = item.Tags.Select(t => t.Id).ToList();
            existingTodo.Tags = await _context.Tags.Where(t => tagIds.Contains(t.Id)).ToListAsync();
        }

        await _context.SaveChangesAsync();

        return await GetByIdAsync(userId, existingTodo.Id);
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var todo = await _context.TodoItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo == null)
            return false;

        _context.TodoItems.Remove(todo);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ToggleCompleteAsync(int userId, int id)
    {
        var todo = await _context.TodoItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo == null)
            return false;

        todo.IsCompleted = !todo.IsCompleted;
        todo.CompletedAt = todo.IsCompleted ? DateTime.UtcNow : null;

        await _context.SaveChangesAsync();

        return true;
    }
}
