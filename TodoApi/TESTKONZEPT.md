# Testkonzept - TodoApi

## 1. Zusammenfassung (Introduction)

Das TodoApi-Projekt ist eine RESTful Web-API zur Verwaltung von Aufgaben (Todos) mit Benutzerauthentifizierung, Kategorien und Tags. Dieses Testkonzept definiert die Teststrategie für Unit-Tests, Integrationstests und API-Tests, um die Qualität und Zuverlässigkeit der Anwendung sicherzustellen.

## 2. Big Picture - System Architektur mit Test Items

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (SPA)                        │
│                  wwwroot/index.html                      │
│                   wwwroot/app.js                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────┐
│                  Web API Layer                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Controllers (Test Items)              │   │
│  │  • AuthController    • TodoController           │   │
│  │  • CategoryController • TagController           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Services (Test Items)                │   │
│  │  • AuthService       • TodoService              │   │
│  │  • JwtService                                   │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               Data Layer (Test Items)                    │
│  • TodoDbContext        • Models (User, TodoItem,       │
│  • Repositories          Category, Tag)                  │
│  • Entity Framework Core • PostgreSQL                    │
└──────────────────────────────────────────────────────────┘
```

## 3. Test Features - Zu testende Elemente

### 3.1 Unit Tests
- **Services**: Geschäftslogik in AuthService, TodoService, JwtService
  - Benutzerregistrierung und Login-Validierung
  - JWT-Token-Generierung und Validierung
  - Todo CRUD-Operationen mit Benutzerkontext
  - Kategorien- und Tag-Verwaltung

### 3.2 Integrationstests
- **API Endpoints**: HTTP-Anfragen und Antworten
  - POST /api/auth/register - Benutzerregistrierung
  - POST /api/auth/login - Authentifizierung
  - GET/POST/PUT/DELETE /api/todo - Todo-Verwaltung
  - GET/POST /api/category - Kategorieverwaltung
  - Autorisierung mit JWT-Token

### 3.3 Datenbankintegration
- Entity Framework Core Migrations
- Datenintegrität und Constraints
- Many-to-Many Beziehungen (TodoItems-Tags)

## 4. Features not to be tested

- **Frontend JavaScript** (app.js) - Separates Frontend-Testing ausserhalb des Scopes
- **Externe Abhängigkeiten**:
  - PostgreSQL-Datenbank-Engine
  - .NET Framework Bibliotheken
  - NuGet-Pakete (BCrypt, JWT, EF Core)
- **Docker-Container-Konfiguration**
- **Swagger UI** - Generierte Dokumentation

## 5. Testvorgehen - Test-Driven Development (TDD)

### TDD-Zyklus:
1. **RED**: Test schreiben, der fehlschlägt
2. **GREEN**: Minimalen Code implementieren, damit Test besteht
3. **REFACTOR**: Code verbessern ohne Funktionalität zu ändern

### Beispiel-Workflow:
```csharp
// 1. RED - Test zuerst
[Fact]
public async Task CreateTodo_WithValidData_ReturnsCreatedTodo()
{
    // Arrange
    var todoDto = new TodoCreateDto { Title = "Test Todo" };

    // Act
    var result = await _controller.Create(todoDto);

    // Assert
    Assert.IsType<CreatedAtActionResult>(result);
}

// 2. GREEN - Implementation
// 3. REFACTOR - Code optimieren
```

## 6. Kriterien für erfolgreiche/nicht-erfolgreiche Tests

### Erfolgreiche Tests:
- Alle Unit-Tests bestehen (100% Pass-Rate)
- Code-Coverage > 80% für Services und Controllers
- Alle API-Endpoints liefern erwartete HTTP-Statuscodes
- Keine unbehandelten Exceptions
- Performance: API-Antworten < 200ms

### Nicht-erfolgreiche Tests:
- Fehlgeschlagene Assertions
- Unerwartete Exceptions
- Timeout bei Datenbankoperationen (> 5 Sekunden)
- Falsche HTTP-Statuscodes
- Sicherheitslücken (z.B. unautorisierter Zugriff)

## 7. Testumgebung - Tools

### Test-Frameworks:
- **xUnit**: Unit-Test-Framework für .NET
- **Moq**: Mocking-Framework für Abhängigkeiten
- **TestServer**: In-Memory Test-Server für Integrationstests
- **FluentAssertions**: Readable Assertions

### Datenbank-Testing:
- **In-Memory Database**: EF Core In-Memory Provider für schnelle Tests
- **Test-Container**: PostgreSQL Docker-Container für Integrationstests

### Weitere Tools:
- **dotnet test**: CLI für Testausführung
- **Coverlet**: Code-Coverage-Tool
- **Postman/Newman**: API-Testing und Automation

## 8. Kurze Planung

### Phase 1: Setup 
- Test-Projekt erstellen (TodoApi.Tests)
- NuGet-Pakete installieren (xUnit, Moq, FluentAssertions)
- Test-Datenbank-Konfiguration

### Phase 2: Unit-Tests 
- Service-Layer Tests implementieren
- Controller-Tests mit gemockten Services
- Mindestens 80% Code-Coverage erreichen

### Phase 3: Integrationstests
- API-Endpoint-Tests mit TestServer
- Authentifizierungs-/Autorisierungstests
- End-to-End Szenarien

### Phase 4: Continuous Integration
- GitHub Actions Workflow für automatische Tests
- Test-Reports und Coverage-Badges
- Pull-Request-Validierung

### Metriken:
- **Ziel-Coverage**: 80%+ für kritische Komponenten
- **Testausführungszeit**: < 30 Sekunden für alle Unit-Tests
- **Automatisierung**: 100% der Tests in CI/CD Pipeline