using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Models.DTOs;

namespace TodoApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly TodoDbContext _context;

    public CategoryController(TodoDbContext context)
    {
        _context = context;
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
    /// Get all categories for the authenticated user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Category>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var userId = GetUserId();
        var categories = await _context.Categories
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Ok(categories);
    }

    /// <summary>
    /// Get a specific category by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Category), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var userId = GetUserId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Category), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Category>> CreateCategory([FromBody] CategoryCreateDto dto)
    {
        var userId = GetUserId();

        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            Color = dto.Color,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    /// <summary>
    /// Update an existing category
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryUpdateDto dto)
    {
        var userId = GetUserId();
        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (existingCategory == null)
        {
            return NotFound();
        }

        existingCategory.Name = dto.Name;
        existingCategory.Description = dto.Description;
        existingCategory.Color = dto.Color;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete a category
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var userId = GetUserId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
