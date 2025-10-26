using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;
using TodoApi.Models.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TodoController : ControllerBase
{
    private readonly ITodoService _todoService;

    public TodoController(ITodoService todoService)
    {
        _todoService = todoService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }

        return userId;
    }

    /// <summary>
    /// Gets all todo items with advanced filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = "CreatedAt",
        [FromQuery] bool sortDescending = true,
        [FromQuery] bool? isCompleted = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? tagId = null,
        [FromQuery] TodoPriority? priority = null,
        [FromQuery] DateTime? dueBefore = null,
        [FromQuery] DateTime? dueAfter = null,
        [FromQuery] string? searchTerm = null)
    {
        var userId = GetUserId();
        var (items, totalCount) = await _todoService.GetAllAsync(
            userId, page, pageSize, sortBy, sortDescending,
            isCompleted, categoryId, tagId, priority, dueBefore, dueAfter, searchTerm
        );

        var response = new
        {
            items,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return Ok(response);
    }

    /// <summary>
    /// Searches todo items by title
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TodoItem>>> Search([FromQuery] string searchTerm)
    {
        var userId = GetUserId();
        var todos = await _todoService.SearchByTitleAsync(userId, searchTerm);
        return Ok(todos);
    }

    /// <summary>
    /// Gets a specific todo item by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoItem>> GetById(int id)
    {
        var userId = GetUserId();
        var todo = await _todoService.GetByIdAsync(userId, id);
        if (todo == null)
            return NotFound();

        return Ok(todo);
    }

    /// <summary>
    /// Creates a new todo item
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<ActionResult<TodoItem>> Create([FromBody] TodoCreateDto dto)
    {
        var userId = GetUserId();

        var item = new TodoItem
        {
            Title = dto.Title,
            Description = dto.Description,
            IsCompleted = dto.IsCompleted,
            Priority = dto.Priority,
            DueDate = dto.DueDate.HasValue ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc) : null,
            CategoryId = dto.CategoryId,
            Tags = dto.TagIds.Select(id => new Tag { Id = id }).ToList()
        };

        var created = await _todoService.CreateAsync(userId, item);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates an existing todo item
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoItem>> Update(int id, [FromBody] TodoUpdateDto dto)
    {
        var userId = GetUserId();

        var item = new TodoItem
        {
            Title = dto.Title,
            Description = dto.Description,
            IsCompleted = dto.IsCompleted,
            Priority = dto.Priority,
            DueDate = dto.DueDate.HasValue ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc) : null,
            CategoryId = dto.CategoryId,
            Tags = dto.TagIds.Select(tagId => new Tag { Id = tagId }).ToList()
        };

        var updated = await _todoService.UpdateAsync(userId, id, item);
        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Toggles the completion status of a todo item
    /// </summary>
    [HttpPatch("{id}/toggle")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ToggleComplete(int id)
    {
        var userId = GetUserId();
        var result = await _todoService.ToggleCompleteAsync(userId, id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Deletes a todo item
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var result = await _todoService.DeleteAsync(userId, id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
