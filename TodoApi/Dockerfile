# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY pr.sln ./
COPY TodoApi/TodoApi.csproj TodoApi/
COPY TodoApi.Tests/TodoApi.Tests.csproj TodoApi.Tests/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY TodoApi/ TodoApi/
COPY TodoApi.Tests/ TodoApi.Tests/

# Build the application
WORKDIR /src/TodoApi
RUN dotnet build -c Release -o /app/build

# Test Stage
FROM build AS test
WORKDIR /src/TodoApi.Tests
RUN dotnet test --no-restore --verbosity normal

# Publish Stage
FROM build AS publish
WORKDIR /src/TodoApi
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1000 appuser && \
    adduser --system --uid 1000 --ingroup appuser --shell /bin/sh appuser

# Copy published application
COPY --from=publish /app/publish .

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "TodoApi.dll"]
