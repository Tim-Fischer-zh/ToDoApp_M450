using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Models.DTOs;
using BCrypt.Net;

namespace TodoApi.Services;

public class AuthService : IAuthService
{
    private readonly TodoDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthService(TodoDbContext context, IJwtService jwtService, IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return null; // Email already exists
        }

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            return null; // Username already exists
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        var expiryHours = int.Parse(_configuration["Jwt:ExpiryHours"] ?? "24");

        return new AuthResponse
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(expiryHours)
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null; // Invalid credentials
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        var expiryHours = int.Parse(_configuration["Jwt:ExpiryHours"] ?? "24");

        return new AuthResponse
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(expiryHours)
        };
    }
}
