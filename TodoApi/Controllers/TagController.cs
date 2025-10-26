using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TagController : ControllerBase
{
    private readonly TodoDbContext _context;

    public TagController(TodoDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all tags (global tags available to all users)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Tag>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Tag>>> GetTags()
    {
        var tags = await _context.Tags
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(tags);
    }

    /// <summary>
    /// Get a specific tag by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Tag), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Tag>> GetTag(int id)
    {
        var tag = await _context.Tags.FindAsync(id);

        if (tag == null)
        {
            return NotFound();
        }

        return Ok(tag);
    }

    /// <summary>
    /// Create a new tag
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Tag), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Tag>> CreateTag([FromBody] Tag tag)
    {
        // Check if tag already exists
        if (await _context.Tags.AnyAsync(t => t.Name == tag.Name))
        {
            return BadRequest(new { message = "Tag with this name already exists" });
        }

        tag.CreatedAt = DateTime.UtcNow;

        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTag), new { id = tag.Id }, tag);
    }

    /// <summary>
    /// Update an existing tag
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTag(int id, [FromBody] Tag tag)
    {
        var existingTag = await _context.Tags.FindAsync(id);

        if (existingTag == null)
        {
            return NotFound();
        }

        existingTag.Name = tag.Name;
        existingTag.Color = tag.Color;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete a tag
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTag(int id)
    {
        var tag = await _context.Tags.FindAsync(id);

        if (tag == null)
        {
            return NotFound();
        }

        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
