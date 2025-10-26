using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Models.DTOs;
using TodoApi.Services;

namespace TodoApi.Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly TodoDbContext _context;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly IConfiguration _configuration;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TodoDbContext(options);
        _jwtServiceMock = new Mock<IJwtService>();

        var configData = new Dictionary<string, string?>
        {
            {"Jwt:ExpiryHours", "24"}
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        _authService = new AuthService(_context, _jwtServiceMock.Object, _configuration);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task RegisterAsync_WithValidRequest_ReturnsAuthResponse()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password123"
        };

        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("fake-jwt-token");

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("test@example.com", result.Email);
        Assert.Equal("fake-jwt-token", result.Token);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task RegisterAsync_WithDuplicateEmail_ReturnsNull()
    {
        // Arrange
        _context.Users.Add(new User
        {
            Username = "existing",
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var request = new RegisterRequest
        {
            Username = "newuser",
            Email = "test@example.com",
            Password = "password123"
        };

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task RegisterAsync_WithDuplicateUsername_ReturnsNull()
    {
        // Arrange
        _context.Users.Add(new User
        {
            Username = "testuser",
            Email = "existing@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var request = new RegisterRequest
        {
            Username = "testuser",
            Email = "new@example.com",
            Password = "password123"
        };

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task RegisterAsync_HashesPasswordWithBCrypt()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password123"
        };

        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("fake-jwt-token");

        // Act
        await _authService.RegisterAsync(request);

        // Assert
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        Assert.NotNull(user);
        Assert.NotEqual("password123", user.PasswordHash); // Password should be hashed
        Assert.True(BCrypt.Net.BCrypt.Verify("password123", user.PasswordHash));
    }

    [Fact]
    public async Task RegisterAsync_SetsCreatedAtToUtcNow()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password123"
        };

        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("fake-jwt-token");

        var before = DateTime.UtcNow;

        // Act
        await _authService.RegisterAsync(request);
        var after = DateTime.UtcNow;

        // Assert
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        Assert.NotNull(user);
        Assert.InRange(user.CreatedAt, before, after);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("password123");
        _context.Users.Add(new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("fake-jwt-token");

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("test@example.com", result.Email);
        Assert.Equal("fake-jwt-token", result.Token);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ReturnsNull()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "password123"
        };

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ReturnsNull()
    {
        // Arrange
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword");
        _context.Users.Add(new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "wrongpassword"
        };

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_UpdatesLastLoginAt()
    {
        // Arrange
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("password123");
        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = null
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("fake-jwt-token");

        var before = DateTime.UtcNow;

        // Act
        await _authService.LoginAsync(request);
        var after = DateTime.UtcNow;

        // Assert
        var updatedUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        Assert.NotNull(updatedUser);
        Assert.NotNull(updatedUser.LastLoginAt);
        Assert.InRange(updatedUser.LastLoginAt.Value, before, after);
    }

    [Fact]
    public async Task LoginAsync_GeneratesJwtToken()
    {
        // Arrange
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("password123");
        _context.Users.Add(new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("fake-jwt-token");

        // Act
        await _authService.LoginAsync(request);

        // Assert
        _jwtServiceMock.Verify(x => x.GenerateToken(It.Is<User>(u => u.Email == "test@example.com")), Times.Once);
    }
}
