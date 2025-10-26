using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Controllers;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Models.DTOs;

namespace TodoApi.Tests.Controllers;

public class CategoryControllerTests : IDisposable
{
    private readonly TodoDbContext _context;
    private readonly CategoryController _controller;

    public CategoryControllerTests()
    {
        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TodoDbContext(options);
        _controller = new CategoryController(_context);

        // Setup HTTP Context with authenticated user (userId = 1)
        var claims = new List<Claim>
        {
            new Claim("sub", "1"),
            new Claim(ClaimTypes.NameIdentifier, "1")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            }
        };
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

        _context.Users.AddRange(user1, user2);

        _context.Categories.AddRange(
            new Category
            {
                Id = 1,
                Name = "Work",
                Description = "Work tasks",
                Color = "#FF0000",
                UserId = 1,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 2,
                Name = "Personal",
                Description = "Personal tasks",
                Color = "#00FF00",
                UserId = 1,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 3,
                Name = "User2 Category",
                Description = "Another user's category",
                Color = "#0000FF",
                UserId = 2,
                CreatedAt = DateTime.UtcNow
            }
        );

        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetCategories_ReturnsOnlyUserCategories()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.GetCategories();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Category>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var categories = Assert.IsAssignableFrom<IEnumerable<Category>>(okResult.Value);
        Assert.Equal(2, categories.Count());
        Assert.All(categories, c => Assert.Equal(1, c.UserId));
    }

    [Fact]
    public async Task GetCategories_OrdersByName()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.GetCategories();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Category>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var categories = Assert.IsAssignableFrom<IEnumerable<Category>>(okResult.Value).ToList();
        Assert.Equal("Personal", categories[0].Name);
        Assert.Equal("Work", categories[1].Name);
    }

    [Fact]
    public async Task GetCategory_WithValidId_ReturnsOkWithCategory()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.GetCategory(1);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Category>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var category = Assert.IsType<Category>(okResult.Value);
        Assert.Equal(1, category.Id);
        Assert.Equal("Work", category.Name);
    }

    [Fact]
    public async Task GetCategory_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.GetCategory(999);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Category>>(result);
        Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    [Fact]
    public async Task GetCategory_WithOtherUsersCategory_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();

        // Act - Try to access user2's category (id=3) as user1
        var result = await _controller.GetCategory(3);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Category>>(result);
        Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    [Fact]
    public async Task CreateCategory_WithValidDto_ReturnsCreatedAtAction()
    {
        // Arrange
        await SeedTestData();
        var createDto = new CategoryCreateDto
        {
            Name = "New Category",
            Description = "New Description",
            Color = "#FFFF00"
        };

        // Act
        var result = await _controller.CreateCategory(createDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Category>>(result);
        var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        Assert.Equal(nameof(_controller.GetCategory), createdResult.ActionName);
        var category = Assert.IsType<Category>(createdResult.Value);
        Assert.Equal("New Category", category.Name);
        Assert.Equal(1, category.UserId);
    }

    [Fact]
    public async Task CreateCategory_SetsUserIdFromToken()
    {
        // Arrange
        await SeedTestData();
        var createDto = new CategoryCreateDto
        {
            Name = "Test Category",
            Color = "#AABBCC"
        };

        // Act
        await _controller.CreateCategory(createDto);

        // Assert
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Name == "Test Category");
        Assert.NotNull(category);
        Assert.Equal(1, category.UserId);
    }

    [Fact]
    public async Task CreateCategory_SetsCreatedAtToUtcNow()
    {
        // Arrange
        await SeedTestData();
        var createDto = new CategoryCreateDto
        {
            Name = "Test Category",
            Color = "#AABBCC"
        };

        var before = DateTime.UtcNow;

        // Act
        await _controller.CreateCategory(createDto);
        var after = DateTime.UtcNow;

        // Assert
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Name == "Test Category");
        Assert.NotNull(category);
        Assert.InRange(category.CreatedAt, before, after);
    }

    [Fact]
    public async Task UpdateCategory_WithValidDto_ReturnsNoContent()
    {
        // Arrange
        await SeedTestData();
        var updateDto = new CategoryUpdateDto
        {
            Name = "Updated Work",
            Description = "Updated Description",
            Color = "#AA0000"
        };

        // Act
        var result = await _controller.UpdateCategory(1, updateDto);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var updated = await _context.Categories.FindAsync(1);
        Assert.NotNull(updated);
        Assert.Equal("Updated Work", updated.Name);
        Assert.Equal("Updated Description", updated.Description);
        Assert.Equal("#AA0000", updated.Color);
    }

    [Fact]
    public async Task UpdateCategory_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();
        var updateDto = new CategoryUpdateDto
        {
            Name = "Updated",
            Color = "#000000"
        };

        // Act
        var result = await _controller.UpdateCategory(999, updateDto);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task UpdateCategory_WithOtherUsersCategory_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();
        var updateDto = new CategoryUpdateDto
        {
            Name = "Hacked",
            Color = "#000000"
        };

        // Act - Try to update user2's category (id=3) as user1
        var result = await _controller.UpdateCategory(3, updateDto);

        // Assert
        Assert.IsType<NotFoundResult>(result);

        var category = await _context.Categories.FindAsync(3);
        Assert.NotNull(category);
        Assert.Equal("User2 Category", category.Name); // Should not be updated
    }

    [Fact]
    public async Task DeleteCategory_WithValidId_ReturnsNoContent()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.DeleteCategory(1);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var deleted = await _context.Categories.FindAsync(1);
        Assert.Null(deleted);
    }

    [Fact]
    public async Task DeleteCategory_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.DeleteCategory(999);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteCategory_WithOtherUsersCategory_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();

        // Act - Try to delete user2's category (id=3) as user1
        var result = await _controller.DeleteCategory(3);

        // Assert
        Assert.IsType<NotFoundResult>(result);

        var category = await _context.Categories.FindAsync(3);
        Assert.NotNull(category); // Should still exist
    }
}
