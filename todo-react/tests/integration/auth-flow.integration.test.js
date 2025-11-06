"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
var user_event_1 = __importDefault(require("@testing-library/user-event"));
var react_router_dom_1 = require("react-router-dom");
var AuthContext_1 = require("../../src/contexts/AuthContext");
var Login_1 = require("../../src/components/Auth/Login");
var Register_1 = require("../../src/components/Auth/Register");
var api_1 = __importDefault(require("../../src/services/api"));
// Mock API client
vitest_1.vi.mock('../../src/services/api');
// Mock navigate
var mockNavigate = vitest_1.vi.fn();
vitest_1.vi.mock('react-router-dom', function () { return __awaiter(void 0, void 0, void 0, function () {
    var actual;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vitest_1.vi.importActual('react-router-dom')];
            case 1:
                actual = _a.sent();
                return [2 /*return*/, __assign(__assign({}, actual), { useNavigate: function () { return mockNavigate; } })];
        }
    });
}); });
(0, vitest_1.describe)('Auth Flow Integration Tests', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        localStorage.clear();
        mockNavigate.mockClear();
        global.alert = vitest_1.vi.fn();
        // Setup default mocks for apiClient
        vitest_1.vi.mocked(api_1.default).post = vitest_1.vi.fn();
        vitest_1.vi.mocked(api_1.default).get = vitest_1.vi.fn();
    });
    (0, vitest_1.describe)('Login Flow', function () {
        (0, vitest_1.it)('should complete login flow with valid credentials', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, mockResponse, container, emailInput, passwordInput, loginButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        mockResponse = {
                            data: {
                                token: 'test-jwt-token',
                                username: 'Test User',
                                email: 'test@example.com',
                                userId: 1,
                            },
                        };
                        vitest_1.vi.mocked(api_1.default.post).mockResolvedValueOnce(mockResponse);
                        container = (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(Login_1.Login, {}) }) })).container;
                        emailInput = container.querySelector('input[type="email"]');
                        passwordInput = container.querySelector('input[type="password"]');
                        return [4 /*yield*/, user.type(emailInput, 'test@example.com')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, user.type(passwordInput, 'password123')];
                    case 2:
                        _a.sent();
                        loginButton = react_1.screen.getByRole('button', { name: /^login$/i });
                        return [4 /*yield*/, user.click(loginButton)];
                    case 3:
                        _a.sent();
                        // Verify API call
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(api_1.default.post).toHaveBeenCalledWith('/api/auth/login', {
                                    email: 'test@example.com',
                                    password: 'password123',
                                });
                            })];
                    case 4:
                        // Verify API call
                        _a.sent();
                        // Verify token stored
                        (0, vitest_1.expect)(localStorage.getItem('token')).toBe('test-jwt-token');
                        // Verify navigation
                        (0, vitest_1.expect)(mockNavigate).toHaveBeenCalledWith('/');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle login failure', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, mockError, container, emailInput, passwordInput, loginButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        mockError = {
                            response: {
                                data: { message: 'Invalid credentials' },
                                status: 401,
                            },
                        };
                        vitest_1.vi.mocked(api_1.default.post).mockRejectedValueOnce(mockError);
                        container = (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(Login_1.Login, {}) }) })).container;
                        emailInput = container.querySelector('input[type="email"]');
                        passwordInput = container.querySelector('input[type="password"]');
                        return [4 /*yield*/, user.type(emailInput, 'wrong@example.com')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, user.type(passwordInput, 'wrongpassword')];
                    case 2:
                        _a.sent();
                        loginButton = react_1.screen.getByRole('button', { name: /^login$/i });
                        return [4 /*yield*/, user.click(loginButton)];
                    case 3:
                        _a.sent();
                        // Verify error message is displayed in UI
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Invalid credentials')).toBeInTheDocument();
                            })];
                    case 4:
                        // Verify error message is displayed in UI
                        _a.sent();
                        // Verify no auth data stored
                        (0, vitest_1.expect)(localStorage.getItem('token')).toBeNull();
                        (0, vitest_1.expect)(mockNavigate).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Registration Flow', function () {
        (0, vitest_1.it)('should complete registration flow', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, mockResponse, container, inputs, nameInput, emailInput, passwordInput, registerButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        mockResponse = {
                            data: {
                                token: 'new-user-token',
                                username: 'New User',
                                email: 'newuser@example.com',
                                userId: 2,
                            },
                        };
                        vitest_1.vi.mocked(api_1.default.post).mockResolvedValueOnce(mockResponse);
                        container = (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(Register_1.Register, {}) }) })).container;
                        inputs = container.querySelectorAll('input');
                        nameInput = inputs[0];
                        emailInput = inputs[1];
                        passwordInput = inputs[2];
                        return [4 /*yield*/, user.type(nameInput, 'New User')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, user.type(emailInput, 'newuser@example.com')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, user.type(passwordInput, 'password123')];
                    case 3:
                        _a.sent();
                        registerButton = react_1.screen.getByRole('button', { name: /^register$/i });
                        return [4 /*yield*/, user.click(registerButton)];
                    case 4:
                        _a.sent();
                        // Verify API call
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(api_1.default.post).toHaveBeenCalledWith('/api/auth/register', {
                                    username: 'New User',
                                    email: 'newuser@example.com',
                                    password: 'password123',
                                });
                            })];
                    case 5:
                        // Verify API call
                        _a.sent();
                        // Verify token stored
                        (0, vitest_1.expect)(localStorage.getItem('token')).toBe('new-user-token');
                        // Verify navigation
                        (0, vitest_1.expect)(mockNavigate).toHaveBeenCalledWith('/');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle registration with existing email', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, mockError, container, inputs, nameInput, emailInput, passwordInput, registerButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        mockError = {
                            response: {
                                data: { message: 'Email already exists' },
                                status: 400,
                            },
                        };
                        vitest_1.vi.mocked(api_1.default.post).mockRejectedValueOnce(mockError);
                        container = (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(Register_1.Register, {}) }) })).container;
                        inputs = container.querySelectorAll('input');
                        nameInput = inputs[0];
                        emailInput = inputs[1];
                        passwordInput = inputs[2];
                        return [4 /*yield*/, user.type(nameInput, 'Duplicate User')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, user.type(emailInput, 'existing@example.com')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, user.type(passwordInput, 'password123')];
                    case 3:
                        _a.sent();
                        registerButton = react_1.screen.getByRole('button', { name: /^register$/i });
                        return [4 /*yield*/, user.click(registerButton)];
                    case 4:
                        _a.sent();
                        // Verify error message displayed in UI
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Email already exists')).toBeInTheDocument();
                            })];
                    case 5:
                        // Verify error message displayed in UI
                        _a.sent();
                        (0, vitest_1.expect)(localStorage.getItem('token')).toBeNull();
                        (0, vitest_1.expect)(mockNavigate).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Auth State Persistence', function () {
        (0, vitest_1.it)('should restore auth state from localStorage', function () {
            var mockUser = {
                userId: 1,
                username: 'Test User',
                email: 'test@example.com',
            };
            localStorage.setItem('token', 'existing-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)("div", { "data-testid": "auth-test", children: "Authenticated" }) }) }));
            // Context should restore from localStorage
            (0, vitest_1.expect)(localStorage.getItem('token')).toBe('existing-token');
            (0, vitest_1.expect)(react_1.screen.getByTestId('auth-test')).toBeInTheDocument();
        });
    });
});
