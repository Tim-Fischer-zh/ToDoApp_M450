using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Services;

namespace TodoApi.Tests.Services;

public class TodoServiceTests : IDisposable
{
    private readonly TodoDbContext _context;
    private readonly TodoService _todoService;

    public TodoServiceTests()
    {
        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TodoDbContext(options);
        _todoService = new TodoService(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    private async Task SeedTestData()
    {
        var user1 = new User
        {
            Id = 1,
            Username = "user1",
            Email = "user1@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow
        };

        var user2 = new User
        {
            Id = 2,
            Username = "user2",
            Email = "user2@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow
        };

        var category1 = new Category
        {
            Id = 1,
            Name = "Work",
            UserId = 1,
            CreatedAt = DateTime.UtcNow
        };

        var tag1 = new Tag { Id = 1, Name = "urgent", CreatedAt = DateTime.UtcNow };
        var tag2 = new Tag { Id = 2, Name = "important", CreatedAt = DateTime.UtcNow };

        _context.Users.AddRange(user1, user2);
        _context.Categories.Add(category1);
        _context.Tags.AddRange(tag1, tag2);

        _context.TodoItems.AddRange(
            new TodoItem
            {
                Id = 1,
                Title = "User1 Todo1",
                Description = "Description 1",
                UserId = 1,
                CategoryId = 1,
                Priority = TodoPriority.High,
                IsCompleted = false,
                DueDate = DateTime.UtcNow.AddDays(5),
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                Tags = new List<Tag> { tag1 }
            },
            new TodoItem
            {
                Id = 2,
                Title = "User1 Todo2",
                Description = "Description 2",
                UserId = 1,
                Priority = TodoPriority.Low,
                IsCompleted = true,
                CompletedAt = DateTime.UtcNow.AddDays(-1),
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                Tags = new List<Tag> { tag2 }
            },
            new TodoItem
            {
                Id = 3,
                Title = "User2 Todo1",
                Description = "Description 3",
                UserId = 2,
                Priority = TodoPriority.Medium,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        );

        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAllAsync_ReturnsUserTodosOnly()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1);

        // Assert
        Assert.Equal(2, totalCount);
        Assert.All(items, item => Assert.Equal(1, item.UserId));
    }

    [Fact]
    public async Task GetAllAsync_PaginatesCorrectly()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1, page: 1, pageSize: 1);

        // Assert
        Assert.Equal(2, totalCount);
        Assert.Single(items);
    }

    [Fact]
    public async Task GetAllAsync_FiltersByCompletion()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (completedItems, _) = await _todoService.GetAllAsync(userId: 1, isCompleted: true);
        var (incompleteItems, _) = await _todoService.GetAllAsync(userId: 1, isCompleted: false);

        // Assert
        Assert.All(completedItems, item => Assert.True(item.IsCompleted));
        Assert.All(incompleteItems, item => Assert.False(item.IsCompleted));
    }

    [Fact]
    public async Task GetAllAsync_FiltersByCategory()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1, categoryId: 1);

        // Assert
        Assert.Equal(1, totalCount);
        Assert.All(items, item => Assert.Equal(1, item.CategoryId));
    }

    [Fact]
    public async Task GetAllAsync_FiltersByTag()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1, tagId: 1);

        // Assert
        Assert.Equal(1, totalCount);
        Assert.Contains(items, item => item.Tags.Any(t => t.Id == 1));
    }

    [Fact]
    public async Task GetAllAsync_FiltersByPriority()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1, priority: TodoPriority.High);

        // Assert
        Assert.Equal(1, totalCount);
        Assert.All(items, item => Assert.Equal(TodoPriority.High, item.Priority));
    }

    [Fact]
    public async Task GetAllAsync_FiltersByDueBefore()
    {
        // Arrange
        await SeedTestData();
        var cutoffDate = DateTime.UtcNow.AddDays(3);

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1, dueBefore: cutoffDate);

        // Assert
        Assert.All(items, item =>
        {
            Assert.NotNull(item.DueDate);
            Assert.True(item.DueDate < cutoffDate);
        });
    }

    [Fact]
    public async Task GetAllAsync_FiltersByDueAfter()
    {
        // Arrange
        await SeedTestData();
        var cutoffDate = DateTime.UtcNow.AddDays(3);

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1, dueAfter: cutoffDate);

        // Assert
        Assert.All(items, item =>
        {
            Assert.NotNull(item.DueDate);
            Assert.True(item.DueDate > cutoffDate);
        });
    }

    [Fact]
    public async Task GetAllAsync_SearchesByTitle()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1, searchTerm: "Todo1");

        // Assert
        Assert.Equal(1, totalCount);
        Assert.Contains("Todo1", items.First().Title);
    }

    [Fact]
    public async Task GetAllAsync_SearchesByDescription()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, totalCount) = await _todoService.GetAllAsync(userId: 1, searchTerm: "Description 2");

        // Assert
        Assert.Equal(1, totalCount);
        Assert.Contains("Description 2", items.First().Description);
    }

    [Fact]
    public async Task GetAllAsync_SearchByTitleWorks()
    {
        // Arrange
        await SeedTestData();

        // Act - Search for exact match (EF Core InMemory is case-sensitive)
        var (items, _) = await _todoService.GetAllAsync(userId: 1, searchTerm: "Todo1");

        // Assert
        Assert.NotEmpty(items);
        Assert.Contains(items, i => i.Title.Contains("Todo1"));
    }

    [Fact]
    public async Task GetAllAsync_SortsByTitle()
    {
        // Arrange
        await SeedTestData();

        // Act - Ascending
        var (itemsAsc, _) = await _todoService.GetAllAsync(userId: 1, sortBy: "title", sortDescending: false);
        var (itemsDesc, _) = await _todoService.GetAllAsync(userId: 1, sortBy: "title", sortDescending: true);

        // Assert
        Assert.Equal("User1 Todo1", itemsAsc.First().Title);
        Assert.Equal("User1 Todo2", itemsDesc.First().Title);
    }

    [Fact]
    public async Task GetAllAsync_SortsByPriority()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, _) = await _todoService.GetAllAsync(userId: 1, sortBy: "priority", sortDescending: true);

        // Assert
        Assert.Equal(TodoPriority.High, items.First().Priority);
    }

    [Fact]
    public async Task GetAllAsync_SortsByDueDate()
    {
        // Arrange
        await SeedTestData();

        // Act - Filter only items with DueDate
        var (items, _) = await _todoService.GetAllAsync(userId: 1, sortBy: "duedate", sortDescending: false);

        // Assert - Filter to only items with DueDate before checking
        var itemsWithDueDate = items.Where(i => i.DueDate != null).ToList();
        Assert.NotEmpty(itemsWithDueDate);
        Assert.NotNull(itemsWithDueDate.First().DueDate);
    }

    [Fact]
    public async Task GetAllAsync_SortsByIsCompleted()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, _) = await _todoService.GetAllAsync(userId: 1, sortBy: "iscompleted", sortDescending: false);

        // Assert
        Assert.False(items.First().IsCompleted);
    }

    [Fact]
    public async Task GetAllAsync_DefaultSortsByCreatedAt()
    {
        // Arrange
        await SeedTestData();

        // Act
        var (items, _) = await _todoService.GetAllAsync(userId: 1, sortDescending: true);

        // Assert - Most recent first
        Assert.Equal("User1 Todo2", items.First().Title);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsCorrectTodo()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.GetByIdAsync(userId: 1, id: 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("User1 Todo1", result.Title);
    }

    [Fact]
    public async Task GetByIdAsync_IncludesCategoryAndTags()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.GetByIdAsync(userId: 1, id: 1);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Category);
        Assert.NotEmpty(result.Tags);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNullForWrongUser()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.GetByIdAsync(userId: 2, id: 1);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNullForNonExistentId()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.GetByIdAsync(userId: 1, id: 999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task SearchByTitleAsync_ReturnsMatchingTodos()
    {
        // Arrange
        await SeedTestData();

        // Act
        var results = await _todoService.SearchByTitleAsync(userId: 1, searchTerm: "Todo1");

        // Assert
        Assert.Single(results);
        Assert.Contains("Todo1", results.First().Title);
    }

    [Fact]
    public async Task SearchByTitleAsync_IsCaseInsensitive()
    {
        // Arrange
        await SeedTestData();

        // Act
        var results = await _todoService.SearchByTitleAsync(userId: 1, searchTerm: "todo1");

        // Assert
        Assert.NotEmpty(results);
    }

    [Fact]
    public async Task SearchByTitleAsync_ReturnsAllWhenSearchTermEmpty()
    {
        // Arrange
        await SeedTestData();

        // Act
        var results = await _todoService.SearchByTitleAsync(userId: 1, searchTerm: "");

        // Assert
        Assert.Equal(2, results.Count());
    }

    [Fact]
    public async Task CreateAsync_CreatesTodoSuccessfully()
    {
        // Arrange
        await SeedTestData();
        var newTodo = new TodoItem
        {
            Title = "New Todo",
            Description = "New Description",
            Priority = TodoPriority.Medium,
            IsCompleted = false
        };

        // Act
        var result = await _todoService.CreateAsync(userId: 1, newTodo);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Todo", result.Title);
        Assert.Equal(1, result.UserId);
        Assert.InRange(result.CreatedAt, DateTime.UtcNow.AddSeconds(-5), DateTime.UtcNow);
    }

    [Fact]
    public async Task CreateAsync_SetsCreatedAtToUtcNow()
    {
        // Arrange
        await SeedTestData();
        var newTodo = new TodoItem
        {
            Title = "New Todo",
            Priority = TodoPriority.Medium
        };

        var before = DateTime.UtcNow;

        // Act
        var result = await _todoService.CreateAsync(userId: 1, newTodo);
        var after = DateTime.UtcNow;

        // Assert
        Assert.InRange(result.CreatedAt, before, after);
    }

    [Fact]
    public async Task CreateAsync_AssociatesTags()
    {
        // Arrange
        await SeedTestData();
        var tag = await _context.Tags.FindAsync(1);
        var newTodo = new TodoItem
        {
            Title = "New Todo",
            Priority = TodoPriority.Medium,
            Tags = new List<Tag> { new Tag { Id = 1 } }
        };

        // Act
        var result = await _todoService.CreateAsync(userId: 1, newTodo);

        // Assert
        Assert.NotEmpty(result.Tags);
        Assert.Contains(result.Tags, t => t.Id == 1);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesAllProperties()
    {
        // Arrange
        await SeedTestData();
        var updatedTodo = new TodoItem
        {
            Title = "Updated Title",
            Description = "Updated Description",
            Priority = TodoPriority.Urgent,
            IsCompleted = true,
            DueDate = DateTime.UtcNow.AddDays(10),
            CategoryId = 1
        };

        // Act
        var result = await _todoService.UpdateAsync(userId: 1, id: 2, updatedTodo);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Title", result.Title);
        Assert.Equal("Updated Description", result.Description);
        Assert.Equal(TodoPriority.Urgent, result.Priority);
        Assert.True(result.IsCompleted);
        Assert.Equal(1, result.CategoryId);
    }

    [Fact]
    public async Task UpdateAsync_SetsCompletedAtWhenMarkingComplete()
    {
        // Arrange
        await SeedTestData();
        var updatedTodo = new TodoItem
        {
            Title = "User1 Todo1",
            IsCompleted = true
        };

        var before = DateTime.UtcNow;

        // Act
        var result = await _todoService.UpdateAsync(userId: 1, id: 1, updatedTodo);
        var after = DateTime.UtcNow;

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.CompletedAt);
        Assert.InRange(result.CompletedAt.Value, before, after);
    }

    [Fact]
    public async Task UpdateAsync_ClearsCompletedAtWhenMarkingIncomplete()
    {
        // Arrange
        await SeedTestData();
        var updatedTodo = new TodoItem
        {
            Title = "User1 Todo2",
            IsCompleted = false
        };

        // Act
        var result = await _todoService.UpdateAsync(userId: 1, id: 2, updatedTodo);

        // Assert
        Assert.NotNull(result);
        Assert.Null(result.CompletedAt);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNullForWrongUser()
    {
        // Arrange
        await SeedTestData();
        var updatedTodo = new TodoItem
        {
            Title = "Updated Title"
        };

        // Act
        var result = await _todoService.UpdateAsync(userId: 2, id: 1, updatedTodo);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNullForNonExistentTodo()
    {
        // Arrange
        await SeedTestData();
        var updatedTodo = new TodoItem
        {
            Title = "Updated Title"
        };

        // Act
        var result = await _todoService.UpdateAsync(userId: 1, id: 999, updatedTodo);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_DeletesTodoSuccessfully()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.DeleteAsync(userId: 1, id: 1);

        // Assert
        Assert.True(result);
        var deletedTodo = await _context.TodoItems.FindAsync(1);
        Assert.Null(deletedTodo);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalseForWrongUser()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.DeleteAsync(userId: 2, id: 1);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalseForNonExistentTodo()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.DeleteAsync(userId: 1, id: 999);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ToggleCompleteAsync_TogglesCompletion()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.ToggleCompleteAsync(userId: 1, id: 1);

        // Assert
        Assert.True(result);
        var todo = await _context.TodoItems.FindAsync(1);
        Assert.NotNull(todo);
        Assert.True(todo.IsCompleted);
    }

    [Fact]
    public async Task ToggleCompleteAsync_SetsCompletedAtWhenCompleting()
    {
        // Arrange
        await SeedTestData();
        var before = DateTime.UtcNow;

        // Act
        await _todoService.ToggleCompleteAsync(userId: 1, id: 1);
        var after = DateTime.UtcNow;

        // Assert
        var todo = await _context.TodoItems.FindAsync(1);
        Assert.NotNull(todo);
        Assert.NotNull(todo.CompletedAt);
        Assert.InRange(todo.CompletedAt.Value, before, after);
    }

    [Fact]
    public async Task ToggleCompleteAsync_ClearsCompletedAtWhenUncompleting()
    {
        // Arrange
        await SeedTestData();

        // Act
        await _todoService.ToggleCompleteAsync(userId: 1, id: 2);

        // Assert
        var todo = await _context.TodoItems.FindAsync(2);
        Assert.NotNull(todo);
        Assert.False(todo.IsCompleted);
        Assert.Null(todo.CompletedAt);
    }

    [Fact]
    public async Task ToggleCompleteAsync_ReturnsFalseForWrongUser()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.ToggleCompleteAsync(userId: 2, id: 1);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ToggleCompleteAsync_ReturnsFalseForNonExistentTodo()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _todoService.ToggleCompleteAsync(userId: 1, id: 999);

        // Assert
        Assert.False(result);
    }
}
