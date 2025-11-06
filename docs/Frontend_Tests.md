# Testkonzept - Frontend (Todo React)

## 1. Zusammenfassung (Introduction)

Das Todo React Frontend ist eine Single Page Application (SPA) zur Verwaltung von Aufgaben mit Benutzerauthentifizierung, Kategorien und Tags. Dieses Testkonzept definiert die Teststrategie für Unit-Tests, Integrationstests und End-to-End-Tests (E2E), um die Qualität und Zuverlässigkeit der Anwendung sicherzustellen.

## 2. Big Picture - System Architektur mit Test Items

```
┌─────────────────────────────────────────────────────────┐
│                    E2E Tests (Playwright)                │
│          • Auth Flow  • Todo Lifecycle                  │
│          • Category/Tag • Error Recovery                │
└────────────────────┬────────────────────────────────────┘
                     │ Full User Journey
┌────────────────────▼────────────────────────────────────┐
│              React Components (Test Items)               │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Auth Components                          │   │
│  │  • Login    • Register    • AuthContext         │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Todo Components                          │   │
│  │  • TodoList  • TodoItem  • TodoEditModal        │   │
│  │  • TodoForm  • TodoFilters                      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Category & Tag Components                │   │
│  │  • CategoryManager  • TagManager                │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ Service Layer
┌────────────────────▼────────────────────────────────────┐
│              Service Layer (Test Items)                  │
│  • authService       • todoService                       │
│  • categoryService   • tagService                        │
│  • API Client (axios interceptors)                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────┐
│                  Backend API                             │
│              http://localhost:5000/api                   │
└──────────────────────────────────────────────────────────┘
```

## 3. Test Features - Zu testende Elemente

### 3.1 Unit Tests (Vitest + React Testing Library)

**Services (72 Tests):**
- authService (11): Login, Register, Token/User Management, Logout
- todoService (15): CRUD Operations, Pagination, Filtering, Search
- categoryService (14): CRUD Operations, Error Handling
- tagService (17): CRUD Operations, Multi-delete, Lifecycle
- API Interceptors (15): Token Injection, 401 Handling, Error Flow

**Components (89 Tests):**
- **Auth Components (30):**
  - Login (10): Form Validation, Success/Error States, Navigation
  - Register (12): Validation, Password Requirements, Error Handling
  - AuthContext (8): State Management, Persistence, Logout

- **Todo Components (59):**
  - TodoList (19): Loading, CRUD, Pagination, Filtering
  - TodoItem (19): Display, Toggle, Edit/Delete, Priority/Category/Tags
  - TodoEditModal (21): Form Editing, Validation, Tag Selection

### 3.2 End-to-End Tests (Playwright)

**Auth Flow (11 Tests):**
- Login/Register Validation
- Successful Authentication
- Logout & Session Persistence
- Protected Route Access

**Todo Lifecycle (10 Tests):**
- Create, Edit, Complete, Delete
- Multiple Todos
- Full Lifecycle Integration

**Category & Tag Management (8 Tests):**
- Create Categories/Tags
- Assignment to Todos
- Filtering & Pagination

**Error Recovery (10 Tests):**
- Network Errors (Offline Mode)
- Session Expiration
- Rapid Actions
- Special Characters & XSS Prevention
- Multi-tab Behavior

## 4. Features not to be tested

- **Backend API Logic** - Separate Backend-Testing
- **External Dependencies**:
  - React Framework Internal
  - Axios Library
  - Tailwind CSS Rendering
- **Browser-specific Bugs** - Playwright deckt primär Chromium ab
- **Performance Testing** - Außerhalb des Scopes
- **Accessibility (a11y)** - Könnte später mit axe-core hinzugefügt werden

## 5. Testvorgehen - Test-Driven Development (TDD)

### TDD-Zyklus:
1. **RED**: Test schreiben, der fehlschlägt
2. **GREEN**: Minimalen Code implementieren, damit Test besteht
3. **REFACTOR**: Code verbessern ohne Funktionalität zu ändern

### Beispiel-Workflow:
```typescript
// 1. RED - Test zuerst
describe('TodoService', () => {
  it('should create a new todo', async () => {
    const newTodo = { title: 'Test Todo', priority: TodoPriority.High };
    const result = await todoService.create(newTodo);
    expect(result.id).toBeDefined();
  });
});

// 2. GREEN - Implementation
// 3. REFACTOR - Code optimieren
```

## 6. Kriterien für erfolgreiche/nicht-erfolgreiche Tests

### Erfolgreiche Tests:
- Alle Unit-Tests bestehen (100% Pass-Rate)
- Code-Coverage > 80% für Services und kritische Komponenten
- Alle E2E-Tests bestehen in Chromium
- Keine unbehandelten Exceptions
- Test-Ausführungszeit:
  - Unit-Tests: < 5 Sekunden
  - E2E-Tests: < 2 Minuten

### Nicht-erfolgreiche Tests:
- Fehlgeschlagene Assertions
- Unerwartete Exceptions oder Console Errors
- Timeout bei API-Calls (> 5 Sekunden)
- XSS-Vulnerabilities
- Fehlende Auth-Token bei geschützten Routen

## 7. Testumgebung - Tools

### Test-Frameworks:
- **Vitest**: Schnelles Unit-Test-Framework mit native ESM Support
- **React Testing Library**: Component Testing mit User-Centric Approach
- **Playwright**: E2E Browser Automation (Chromium)
- **@testing-library/user-event**: Realistic User Interactions

### Mocking & Helpers:
- **vi.mock()**: Service Mocking für isolierte Tests
- **MSW** (Mock Service Worker): API Response Mocking (optional)
- **jsdom**: DOM Simulation für Unit-Tests

### Weitere Tools:
- **npm run test**: Vitest im Watch Mode
- **npm run test:run**: Vitest Single Run
- **npm run test:coverage**: Code Coverage Report
- **npm run test:e2e**: Playwright E2E Tests
- **npm run test:e2e:ui**: Playwright UI Mode (Debugging)

## 8. Kurze Planung

### Phase 1: Setup ✅
- Vitest & Testing Library installiert
- Playwright konfiguriert
- Test-Verzeichnisstruktur angelegt

### Phase 2: Unit-Tests ✅
- Service-Layer Tests (72 Tests)
- Component-Layer Tests (89 Tests)
- **Erreicht: 161 Unit-Tests, 100% Pass-Rate**

### Phase 3: E2E-Tests ✅
- Auth Flow (11 Tests)
- Todo Lifecycle (10 Tests)
- Category/Tag Management (8 Tests)
- Error Recovery (10 Tests)
- **Erreicht: 39 E2E-Szenarien**

### Phase 4: Continuous Integration (Optional)
- GitHub Actions Workflow
- Automatische Tests bei PRs
- Coverage-Badges

### Metriken:
- **Ziel-Coverage**: 80%+ für kritische Komponenten ✅
- **Unit-Test Execution**: < 5 Sekunden ✅ (aktuell ~3s)
- **E2E-Test Execution**: < 2 Minuten (abhängig von Backend)
- **Total Tests**: 161 Unit + 39 E2E = **200 Tests**

## 9. Test-Kommandos

### Unit-Tests
```bash
# Watch Mode (Entwicklung)
npm run test

# Single Run (CI)
npm run test:run

# Mit UI
npm run test:ui

# Coverage Report
npm run test:coverage
```

### E2E-Tests
```bash
# Headless Mode
npm run test:e2e

# UI Mode (Debugging)
npm run test:e2e:ui

# Einzelne Test-Datei
npx playwright test tests/e2e/auth.spec.ts

# Mit Browser sichtbar
npx playwright test --headed
```

### Coverage Ziel
```bash
npm run test:coverage
# Thresholds: 80% lines, functions, branches, statements
```

## 10. Testdaten & Setup

### Test-Benutzer
Für E2E-Tests wird ein Test-Benutzer benötigt:
- **Email**: test@example.com
- **Password**: password123

Dieser sollte im Backend-Seed-Script angelegt werden.

### Test-Isolation
- Unit-Tests: Komplett isoliert mit Mocks
- E2E-Tests: Gegen echtes Backend (localhost:5000)
- Jeder E2E-Test räumt nach sich auf (wo möglich)

## 11. Best Practices

1. **Unit-Tests**: Komponenten isoliert testen, Services mocken
2. **E2E-Tests**: Kritische User-Flows end-to-end testen
3. **Avoid Flakiness**:
   - Explizite Waits verwenden (`await expect().toBeVisible()`)
   - Keine festen `waitForTimeout` ohne Grund
4. **Test-Namen**: Beschreibend und in User-Perspektive
5. **Cleanup**: `beforeEach` für Fresh State

## 12. Bekannte Einschränkungen

- **E2E-Tests** erfordern laufendes Backend (localhost:5000)
- **Network Mocking** in E2E optional (derzeit gegen echtes Backend)
- **act() Warnings** in einigen Komponententests (nicht kritisch)
- **TypeScript Errors** für `.toBeInTheDocument()` (false positives, Tests funktionieren)

---

## Zusammenfassung

Diese Teststrategie stellt sicher, dass:
- Die Frontend-Qualität auf Unit- und E2E-Ebene überprüft wird
- Kritische User-Flows automatisiert getestet werden
- Auth-Token-Handling und API-Interceptors korrekt funktionieren
- XSS und andere Sicherheitslücken verhindert werden
- Die Anwendung stabil, sicher und wartbar bleibt

**Stand:** 161 Unit-Tests + 39 E2E-Szenarien = **200 Tests Total** ✅
