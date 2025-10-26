using Microsoft.AspNetCore.Mvc;
using Moq;
using TodoApi.Controllers;
using TodoApi.Models.DTOs;
using TodoApi.Services;

namespace TodoApi.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _controller = new AuthController(_authServiceMock.Object);
    }

    [Fact]
    public async Task Register_WithValidRequest_Returns201Created()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password123"
        };

        var expectedResponse = new AuthResponse
        {
            UserId = 1,
            Username = "testuser",
            Email = "test@example.com",
            Token = "fake-jwt-token",
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        _authServiceMock.Setup(x => x.RegisterAsync(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var actionResult = Assert.IsType<ActionResult<AuthResponse>>(result);
        var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        Assert.Equal(201, createdResult.StatusCode);
        var authResponse = Assert.IsType<AuthResponse>(createdResult.Value);
        Assert.Equal("testuser", authResponse.Username);
        Assert.Equal("test@example.com", authResponse.Email);
    }

    [Fact]
    public async Task Register_WithDuplicateUser_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "existinguser",
            Email = "existing@example.com",
            Password = "password123"
        };

        _authServiceMock.Setup(x => x.RegisterAsync(request))
            .ReturnsAsync((AuthResponse?)null);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var actionResult = Assert.IsType<ActionResult<AuthResponse>>(result);
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        Assert.Equal(400, badRequestResult.StatusCode);
    }

    [Fact]
    public async Task Register_CallsAuthService()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password123"
        };

        _authServiceMock.Setup(x => x.RegisterAsync(request))
            .ReturnsAsync(new AuthResponse
            {
                UserId = 1,
                Username = "testuser",
                Email = "test@example.com",
                Token = "token",
                ExpiresAt = DateTime.UtcNow
            });

        // Act
        await _controller.Register(request);

        // Assert
        _authServiceMock.Verify(x => x.RegisterAsync(request), Times.Once);
    }

    [Fact]
    public async Task Login_WithValidCredentials_Returns200Ok()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var expectedResponse = new AuthResponse
        {
            UserId = 1,
            Username = "testuser",
            Email = "test@example.com",
            Token = "fake-jwt-token",
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        _authServiceMock.Setup(x => x.LoginAsync(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var actionResult = Assert.IsType<ActionResult<AuthResponse>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        Assert.Equal(200, okResult.StatusCode);
        var authResponse = Assert.IsType<AuthResponse>(okResult.Value);
        Assert.Equal("testuser", authResponse.Username);
        Assert.Equal("fake-jwt-token", authResponse.Token);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_Returns401Unauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "wrong@example.com",
            Password = "wrongpassword"
        };

        _authServiceMock.Setup(x => x.LoginAsync(request))
            .ReturnsAsync((AuthResponse?)null);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var actionResult = Assert.IsType<ActionResult<AuthResponse>>(result);
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(actionResult.Result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
    }

    [Fact]
    public async Task Login_CallsAuthService()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        _authServiceMock.Setup(x => x.LoginAsync(request))
            .ReturnsAsync(new AuthResponse
            {
                UserId = 1,
                Username = "testuser",
                Email = "test@example.com",
                Token = "token",
                ExpiresAt = DateTime.UtcNow
            });

        // Act
        await _controller.Login(request);

        // Assert
        _authServiceMock.Verify(x => x.LoginAsync(request), Times.Once);
    }
}
