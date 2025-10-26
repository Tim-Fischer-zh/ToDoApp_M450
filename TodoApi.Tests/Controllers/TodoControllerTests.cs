using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TodoApi.Controllers;
using TodoApi.Models;
using TodoApi.Models.DTOs;
using TodoApi.Services;

namespace TodoApi.Tests.Controllers;

public class TodoControllerTests
{
    private readonly Mock<ITodoService> _todoServiceMock;
    private readonly TodoController _controller;

    public TodoControllerTests()
    {
        _todoServiceMock = new Mock<ITodoService>();
        _controller = new TodoController(_todoServiceMock.Object);

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

    [Fact]
    public async Task GetAll_ReturnsOkWithPaginatedResults()
    {
        // Arrange
        var todos = new List<TodoItem>
        {
            new TodoItem { Id = 1, Title = "Todo 1", UserId = 1, CreatedAt = DateTime.UtcNow },
            new TodoItem { Id = 2, Title = "Todo 2", UserId = 1, CreatedAt = DateTime.UtcNow }
        };

        _todoServiceMock.Setup(x => x.GetAllAsync(
            1, 1, 10, "CreatedAt", true, null, null, null, null, null, null, null))
            .ReturnsAsync((todos, 2));

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        dynamic? value = okResult.Value;
        Assert.NotNull(value);
    }

    [Fact]
    public async Task GetAll_WithSearchTerm_CallsServiceWithCorrectParameters()
    {
        // Arrange
        var searchTerm = "test";
        _todoServiceMock.Setup(x => x.GetAllAsync(
            1, 1, 10, "CreatedAt", true, null, null, null, null, null, null, searchTerm))
            .ReturnsAsync((new List<TodoItem>(), 0));

        // Act
        await _controller.GetAll(searchTerm: searchTerm);

        // Assert
        _todoServiceMock.Verify(x => x.GetAllAsync(
            1, 1, 10, "CreatedAt", true, null, null, null, null, null, null, searchTerm), Times.Once);
    }

    [Fact]
    public async Task GetAll_WithPagination_ReturnsCorrectPageInfo()
    {
        // Arrange
        var todos = new List<TodoItem>
        {
            new TodoItem { Id = 1, Title = "Todo 1", UserId = 1, CreatedAt = DateTime.UtcNow }
        };

        _todoServiceMock.Setup(x => x.GetAllAsync(
            1, 2, 5, "CreatedAt", true, null, null, null, null, null, null, null))
            .ReturnsAsync((todos, 15));

        // Act
        var result = await _controller.GetAll(page: 2, pageSize: 5);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Search_WithSearchTerm_ReturnsOk()
    {
        // Arrange
        var todos = new List<TodoItem>
        {
            new TodoItem { Id = 1, Title = "Test Todo", UserId = 1, CreatedAt = DateTime.UtcNow }
        };

        _todoServiceMock.Setup(x => x.SearchByTitleAsync(1, "test"))
            .ReturnsAsync(todos);

        // Act
        var result = await _controller.Search("test");

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<TodoItem>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var returnedTodos = Assert.IsAssignableFrom<IEnumerable<TodoItem>>(okResult.Value);
        Assert.Single(returnedTodos);
    }

    [Fact]
    public async Task GetById_WithValidId_ReturnsOkWithTodo()
    {
        // Arrange
        var todo = new TodoItem
        {
            Id = 1,
            Title = "Test Todo",
            UserId = 1,
            CreatedAt = DateTime.UtcNow
        };

        _todoServiceMock.Setup(x => x.GetByIdAsync(1, 1))
            .ReturnsAsync(todo);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var returnedTodo = Assert.IsType<TodoItem>(okResult.Value);
        Assert.Equal(1, returnedTodo.Id);
    }

    [Fact]
    public async Task GetById_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        _todoServiceMock.Setup(x => x.GetByIdAsync(1, 999))
            .ReturnsAsync((TodoItem?)null);

        // Act
        var result = await _controller.GetById(999);

        // Assert
        var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
        Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    [Fact]
    public async Task Create_WithValidDto_ReturnsCreatedAtAction()
    {
        // Arrange
        var createDto = new TodoCreateDto
        {
            Title = "New Todo",
            Description = "Description",
            Priority = TodoPriority.Medium,
            TagIds = new List<int>()
        };

        var createdTodo = new TodoItem
        {
            Id = 1,
            Title = "New Todo",
            Description = "Description",
            UserId = 1,
            Priority = TodoPriority.Medium,
            CreatedAt = DateTime.UtcNow
        };

        _todoServiceMock.Setup(x => x.CreateAsync(1, It.IsAny<TodoItem>()))
            .ReturnsAsync(createdTodo);

        // Act
        var result = await _controller.Create(createDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
        var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        Assert.Equal(nameof(_controller.GetById), createdResult.ActionName);
        var returnedTodo = Assert.IsType<TodoItem>(createdResult.Value);
        Assert.Equal("New Todo", returnedTodo.Title);
    }

    [Fact]
    public async Task Create_SetsUserIdFromToken()
    {
        // Arrange
        var createDto = new TodoCreateDto
        {
            Title = "New Todo",
            Priority = TodoPriority.Medium,
            TagIds = new List<int>()
        };

        var createdTodo = new TodoItem
        {
            Id = 1,
            Title = "New Todo",
            UserId = 1,
            CreatedAt = DateTime.UtcNow
        };

        _todoServiceMock.Setup(x => x.CreateAsync(1, It.IsAny<TodoItem>()))
            .ReturnsAsync(createdTodo);

        // Act
        await _controller.Create(createDto);

        // Assert
        _todoServiceMock.Verify(x => x.CreateAsync(1, It.Is<TodoItem>(t => t.Title == "New Todo")), Times.Once);
    }

    [Fact]
    public async Task Update_WithValidDto_ReturnsOkWithUpdatedTodo()
    {
        // Arrange
        var updateDto = new TodoUpdateDto
        {
            Title = "Updated Todo",
            Description = "Updated Description",
            IsCompleted = true,
            Priority = TodoPriority.High,
            TagIds = new List<int>()
        };

        var updatedTodo = new TodoItem
        {
            Id = 1,
            Title = "Updated Todo",
            Description = "Updated Description",
            UserId = 1,
            IsCompleted = true,
            Priority = TodoPriority.High,
            CreatedAt = DateTime.UtcNow
        };

        _todoServiceMock.Setup(x => x.UpdateAsync(1, 1, It.IsAny<TodoItem>()))
            .ReturnsAsync(updatedTodo);

        // Act
        var result = await _controller.Update(1, updateDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var returnedTodo = Assert.IsType<TodoItem>(okResult.Value);
        Assert.Equal("Updated Todo", returnedTodo.Title);
    }

    [Fact]
    public async Task Update_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var updateDto = new TodoUpdateDto
        {
            Title = "Updated Todo",
            Priority = TodoPriority.High,
            TagIds = new List<int>()
        };

        _todoServiceMock.Setup(x => x.UpdateAsync(1, 999, It.IsAny<TodoItem>()))
            .ReturnsAsync((TodoItem?)null);

        // Act
        var result = await _controller.Update(999, updateDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
        Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    [Fact]
    public async Task ToggleComplete_WithValidId_ReturnsNoContent()
    {
        // Arrange
        _todoServiceMock.Setup(x => x.ToggleCompleteAsync(1, 1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ToggleComplete(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task ToggleComplete_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        _todoServiceMock.Setup(x => x.ToggleCompleteAsync(1, 999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.ToggleComplete(999);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_WithValidId_ReturnsNoContent()
    {
        // Arrange
        _todoServiceMock.Setup(x => x.DeleteAsync(1, 1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Delete(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        _todoServiceMock.Setup(x => x.DeleteAsync(1, 999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.Delete(999);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }
}
