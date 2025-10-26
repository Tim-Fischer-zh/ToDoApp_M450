using Microsoft.Extensions.Configuration;
using Moq;
using TodoApi.Models;
using TodoApi.Services;

namespace TodoApi.Tests.Services;

public class JwtServiceTests
{
    private readonly IConfiguration _configuration;
    private readonly JwtService _jwtService;

    public JwtServiceTests()
    {
        var configData = new Dictionary<string, string?>
        {
            {"Jwt:Secret", "ThisIsATestSecretKeyForJwtTokenGeneration123456"},
            {"Jwt:Issuer", "https://test.localhost"},
            {"Jwt:Audience", "https://test.localhost"},
            {"Jwt:ExpiryHours", "1"}
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        _jwtService = new JwtService(_configuration);
    }

    [Fact]
    public void GenerateToken_WithValidUser_ReturnsValidToken()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        Assert.Contains(".", token); // JWT format has dots
    }

    [Fact]
    public void GenerateToken_TokenContainsCorrectClaims()
    {
        // Arrange
        var user = new User
        {
            Id = 42,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        // Act
        var token = _jwtService.GenerateToken(user);
        var userId = _jwtService.ValidateToken(token);

        // Assert
        Assert.Equal(42, userId);
    }

    [Fact]
    public void ValidateToken_WithValidToken_ReturnsUserId()
    {
        // Arrange
        var user = new User
        {
            Id = 123,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };
        var token = _jwtService.GenerateToken(user);

        // Act
        var userId = _jwtService.ValidateToken(token);

        // Assert
        Assert.NotNull(userId);
        Assert.Equal(123, userId.Value);
    }

    [Fact]
    public void ValidateToken_WithInvalidToken_ReturnsNull()
    {
        // Arrange
        var invalidToken = "invalid.token.here";

        // Act
        var userId = _jwtService.ValidateToken(invalidToken);

        // Assert
        Assert.Null(userId);
    }

    [Fact]
    public void ValidateToken_WithTamperedToken_ReturnsNull()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };
        var token = _jwtService.GenerateToken(user);
        var tamperedToken = token + "tampered";

        // Act
        var userId = _jwtService.ValidateToken(tamperedToken);

        // Assert
        Assert.Null(userId);
    }

    [Fact]
    public void ValidateToken_WithWrongIssuer_ReturnsNull()
    {
        // Arrange
        var configData = new Dictionary<string, string?>
        {
            {"Jwt:Secret", "ThisIsATestSecretKeyForJwtTokenGeneration123456"},
            {"Jwt:Issuer", "https://wrong-issuer.com"},
            {"Jwt:Audience", "https://test.localhost"},
            {"Jwt:ExpiryHours", "1"}
        };

        var wrongConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var wrongIssuerService = new JwtService(wrongConfig);
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        var token = wrongIssuerService.GenerateToken(user);

        // Act - Try to validate with original service (different issuer)
        var userId = _jwtService.ValidateToken(token);

        // Assert
        Assert.Null(userId);
    }

    [Fact]
    public void ValidateToken_WithWrongAudience_ReturnsNull()
    {
        // Arrange
        var configData = new Dictionary<string, string?>
        {
            {"Jwt:Secret", "ThisIsATestSecretKeyForJwtTokenGeneration123456"},
            {"Jwt:Issuer", "https://test.localhost"},
            {"Jwt:Audience", "https://wrong-audience.com"},
            {"Jwt:ExpiryHours", "1"}
        };

        var wrongConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var wrongAudienceService = new JwtService(wrongConfig);
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        var token = wrongAudienceService.GenerateToken(user);

        // Act - Try to validate with original service (different audience)
        var userId = _jwtService.ValidateToken(token);

        // Assert
        Assert.Null(userId);
    }

    [Fact]
    public void ValidateToken_WithEmptyToken_ReturnsNull()
    {
        // Act
        var userId = _jwtService.ValidateToken("");

        // Assert
        Assert.Null(userId);
    }

    [Fact]
    public void GenerateToken_WithValidSecret_GeneratesToken()
    {
        // Arrange
        var configData = new Dictionary<string, string?>
        {
            {"Jwt:Secret", "ThisIsAValidSecretKeyWith32CharsMinimum1234567890"},
            {"Jwt:Issuer", "https://test.localhost"},
            {"Jwt:Audience", "https://test.localhost"}
        };

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var jwtService = new JwtService(config);
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        // Act
        var token = jwtService.GenerateToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }
}
