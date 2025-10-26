using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Controllers;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Tests.Controllers;

public class TagControllerTests : IDisposable
{
    private readonly TodoDbContext _context;
    private readonly TagController _controller;

    public TagControllerTests()
    {
        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TodoDbContext(options);
        _controller = new TagController(_context);

        // Setup HTTP Context with authenticated user
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
        _context.Tags.AddRange(
            new Tag
            {
                Id = 1,
                Name = "urgent",
                Color = "#FF0000",
                CreatedAt = DateTime.UtcNow
            },
            new Tag
            {
                Id = 2,
                Name = "important",
                Color = "#00FF00",
                CreatedAt = DateTime.UtcNow
            },
            new Tag
            {
                Id = 3,
                Name = "optional",
                Color = "#0000FF",
                CreatedAt = DateTime.UtcNow
            }
        );

        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetTags_ReturnsAllTags()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.GetTags();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Tag>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var tags = Assert.IsAssignableFrom<IEnumerable<Tag>>(okResult.Value);
        Assert.Equal(3, tags.Count());
    }

    [Fact]
    public async Task GetTags_OrdersByName()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.GetTags();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Tag>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var tags = Assert.IsAssignableFrom<IEnumerable<Tag>>(okResult.Value).ToList();
        Assert.Equal("important", tags[0].Name);
        Assert.Equal("optional", tags[1].Name);
        Assert.Equal("urgent", tags[2].Name);
    }

    [Fact]
    public async Task GetTag_WithValidId_ReturnsOkWithTag()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.GetTag(1);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Tag>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var tag = Assert.IsType<Tag>(okResult.Value);
        Assert.Equal(1, tag.Id);
        Assert.Equal("urgent", tag.Name);
    }

    [Fact]
    public async Task GetTag_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.GetTag(999);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Tag>>(result);
        Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    [Fact]
    public async Task CreateTag_WithValidTag_ReturnsCreatedAtAction()
    {
        // Arrange
        await SeedTestData();
        var newTag = new Tag
        {
            Name = "newtag",
            Color = "#FFFF00"
        };

        // Act
        var result = await _controller.CreateTag(newTag);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Tag>>(result);
        var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        Assert.Equal(nameof(_controller.GetTag), createdResult.ActionName);
        var tag = Assert.IsType<Tag>(createdResult.Value);
        Assert.Equal("newtag", tag.Name);
    }

    [Fact]
    public async Task CreateTag_WithDuplicateName_ReturnsBadRequest()
    {
        // Arrange
        await SeedTestData();
        var duplicateTag = new Tag
        {
            Name = "urgent", // Already exists
            Color = "#AABBCC"
        };

        // Act
        var result = await _controller.CreateTag(duplicateTag);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Tag>>(result);
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        Assert.Contains("already exists", badRequestResult.Value?.ToString());
    }

    [Fact]
    public async Task CreateTag_SetsCreatedAtToUtcNow()
    {
        // Arrange
        await SeedTestData();
        var newTag = new Tag
        {
            Name = "testtag",
            Color = "#AABBCC"
        };

        var before = DateTime.UtcNow;

        // Act
        await _controller.CreateTag(newTag);
        var after = DateTime.UtcNow;

        // Assert
        var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == "testtag");
        Assert.NotNull(tag);
        Assert.InRange(tag.CreatedAt, before, after);
    }

    [Fact]
    public async Task UpdateTag_WithValidTag_ReturnsNoContent()
    {
        // Arrange
        await SeedTestData();
        var updatedTag = new Tag
        {
            Id = 1,
            Name = "super-urgent",
            Color = "#AA0000"
        };

        // Act
        var result = await _controller.UpdateTag(1, updatedTag);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var tag = await _context.Tags.FindAsync(1);
        Assert.NotNull(tag);
        Assert.Equal("super-urgent", tag.Name);
        Assert.Equal("#AA0000", tag.Color);
    }

    [Fact]
    public async Task UpdateTag_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();
        var updatedTag = new Tag
        {
            Id = 999,
            Name = "notfound",
            Color = "#000000"
        };

        // Act
        var result = await _controller.UpdateTag(999, updatedTag);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteTag_WithValidId_ReturnsNoContent()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.DeleteTag(1);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var deleted = await _context.Tags.FindAsync(1);
        Assert.Null(deleted);
    }

    [Fact]
    public async Task DeleteTag_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        await SeedTestData();

        // Act
        var result = await _controller.DeleteTag(999);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Tags_AreGlobal_NotUserSpecific()
    {
        // Arrange
        await SeedTestData();

        // Act - Get all tags as user 1
        var result = await _controller.GetTags();

        // Assert - Should return all tags (not filtered by user)
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Tag>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var tags = Assert.IsAssignableFrom<IEnumerable<Tag>>(okResult.Value);
        Assert.Equal(3, tags.Count()); // All tags, not filtered by userId
    }
}
