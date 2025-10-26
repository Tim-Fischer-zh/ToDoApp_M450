using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TodoApi.Data;
using TodoApi.Services;

// Clear default claim mapping to preserve JWT claim names
Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// Load configuration from appsettings.json and environment variables
// Environment variables take precedence over appsettings.json
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

// Add Database Context
// Connection string comes from environment variable: ConnectionStrings__DefaultConnection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string not configured. " +
        "Set environment variable 'ConnectionStrings__DefaultConnection' or configure in appsettings.json");
}

builder.Services.AddDbContext<TodoDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Todo API",
        Version = "v2",
        Description = "Todo API with Authentication, Categories, Tags, and Filtering"
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure JWT Authentication
// JWT settings come from environment variables: Jwt__Secret, Jwt__Issuer, Jwt__Audience
var jwtSecret = builder.Configuration["Jwt:Secret"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtSecret))
{
    throw new InvalidOperationException(
        "JWT Secret not configured. " +
        "Set environment variable 'JWT_SECRET' or 'Jwt__Secret'");
}

if (string.IsNullOrEmpty(jwtIssuer))
{
    throw new InvalidOperationException(
        "JWT Issuer not configured. " +
        "Set environment variable 'JWT_ISSUER' or 'Jwt__Issuer'");
}

if (string.IsNullOrEmpty(jwtAudience))
{
    throw new InvalidOperationException(
        "JWT Audience not configured. " +
        "Set environment variable 'JWT_AUDIENCE' or 'Jwt__Audience'");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ITodoService, TodoService>();

// Add CORS with updated policy to allow credentials
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Run database migrations automatically with retry logic
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var maxRetries = 10;
    var delayMs = 3000;

    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            var context = services.GetRequiredService<TodoDbContext>();
            context.Database.Migrate();
            Console.WriteLine("Database migrations applied successfully.");
            break;
        }
        catch (Exception ex)
        {
            if (i == maxRetries - 1)
            {
                Console.WriteLine($"Failed to migrate database after {maxRetries} attempts: {ex.Message}");
                throw;
            }
            Console.WriteLine($"Database not ready, retrying in {delayMs / 1000} seconds... (Attempt {i + 1}/{maxRetries})");
            Thread.Sleep(delayMs);
        }
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
   .AllowAnonymous();

app.Run();
