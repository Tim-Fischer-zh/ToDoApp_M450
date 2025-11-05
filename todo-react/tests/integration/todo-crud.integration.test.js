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
var TodoList_1 = require("../../src/components/Todo/TodoList");
var todoService_1 = require("../../src/services/todoService");
var categoryService_1 = require("../../src/services/categoryService");
var tagService_1 = require("../../src/services/tagService");
var types_1 = require("../../src/types");
vitest_1.vi.mock('../../src/services/todoService');
vitest_1.vi.mock('../../src/services/categoryService');
vitest_1.vi.mock('../../src/services/tagService');
(0, vitest_1.describe)('Todo CRUD Integration Tests', function () {
    var mockTodo = {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        isCompleted: false,
        priority: types_1.TodoPriority.Medium,
        dueDate: '2025-12-31T23:59:00',
        createdAt: '2025-01-01T00:00:00',
        updatedAt: '2025-01-01T00:00:00',
        userId: 1,
        categoryId: 1,
        tags: [],
    };
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        global.confirm = vitest_1.vi.fn(function () { return true; });
        global.alert = vitest_1.vi.fn();
        // Mock category and tag services
        vitest_1.vi.mocked(categoryService_1.categoryService.getAll).mockResolvedValue([
            { id: 1, name: 'Work', color: '#3B82F6', userId: 1 },
        ]);
        vitest_1.vi.mocked(tagService_1.tagService.getAll).mockResolvedValue([
            { id: 1, name: 'Important', color: '#EF4444', userId: 1 },
        ]);
    });
    (0, vitest_1.describe)('Load and Display Todos', function () {
        (0, vitest_1.it)('should load and display todos', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [mockTodo],
                            totalCount: 1,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Test Todo')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(react_1.screen.getByText('Test Description')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle empty todo list', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [],
                            totalCount: 0,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText(/no todos found/i)).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Create Todo', function () {
        (0, vitest_1.it)('should create a new todo', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, newTodo, titleInput, addButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        // Initial empty list
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [],
                            totalCount: 0,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.queryByText(/loading/i)).not.toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        newTodo = __assign(__assign({}, mockTodo), { id: 2, title: 'New Todo' });
                        // Mock create and reload
                        vitest_1.vi.mocked(todoService_1.todoService.create).mockResolvedValueOnce(newTodo);
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [newTodo],
                            totalCount: 1,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        titleInput = react_1.screen.getByPlaceholderText(/todo title/i);
                        return [4 /*yield*/, user.type(titleInput, 'New Todo')];
                    case 2:
                        _a.sent();
                        addButton = react_1.screen.getByRole('button', { name: /add todo/i });
                        return [4 /*yield*/, user.click(addButton)];
                    case 3:
                        _a.sent();
                        // Verify API call
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(todoService_1.todoService.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                                    title: 'New Todo',
                                    isCompleted: false,
                                }));
                            })];
                    case 4:
                        // Verify API call
                        _a.sent();
                        // Verify todo appears
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('New Todo')).toBeInTheDocument();
                            })];
                    case 5:
                        // Verify todo appears
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Update Todo', function () {
        (0, vitest_1.it)('should toggle todo completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, completedTodo, checkboxes, todoCheckbox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [mockTodo],
                            totalCount: 1,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Test Todo')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        completedTodo = __assign(__assign({}, mockTodo), { isCompleted: true });
                        // Mock toggle and reload
                        vitest_1.vi.mocked(todoService_1.todoService.toggle).mockResolvedValueOnce();
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [completedTodo],
                            totalCount: 1,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        checkboxes = react_1.screen.getAllByRole('checkbox');
                        todoCheckbox = checkboxes[checkboxes.length - 1];
                        return [4 /*yield*/, user.click(todoCheckbox)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(todoService_1.todoService.toggle).toHaveBeenCalledWith(1);
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should edit todo via modal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, editButton, updatedTodo, titleInput, saveButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [mockTodo],
                            totalCount: 1,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Test Todo')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        editButton = react_1.screen.getByRole('button', { name: /edit/i });
                        return [4 /*yield*/, user.click(editButton)];
                    case 2:
                        _a.sent();
                        // Wait for modal
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Edit Todo')).toBeInTheDocument();
                            })];
                    case 3:
                        // Wait for modal
                        _a.sent();
                        updatedTodo = __assign(__assign({}, mockTodo), { title: 'Updated Todo' });
                        vitest_1.vi.mocked(todoService_1.todoService.update).mockResolvedValueOnce(updatedTodo);
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [updatedTodo],
                            totalCount: 1,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        titleInput = react_1.screen.getByDisplayValue('Test Todo');
                        return [4 /*yield*/, user.clear(titleInput)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, user.type(titleInput, 'Updated Todo')];
                    case 5:
                        _a.sent();
                        saveButton = react_1.screen.getByRole('button', { name: /^save$/i });
                        return [4 /*yield*/, user.click(saveButton)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(todoService_1.todoService.update).toHaveBeenCalledWith(1, vitest_1.expect.objectContaining({
                                    title: 'Updated Todo',
                                }));
                            })];
                    case 7:
                        _a.sent();
                        // Verify updated todo appears
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Updated Todo')).toBeInTheDocument();
                            })];
                    case 8:
                        // Verify updated todo appears
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Delete Todo', function () {
        (0, vitest_1.it)('should delete todo', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, mockTodos, deleteButtons;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        mockTodos = [mockTodo, __assign(__assign({}, mockTodo), { id: 2, title: 'Second Todo' })];
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: mockTodos,
                            totalCount: 2,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Test Todo')).toBeInTheDocument();
                                (0, vitest_1.expect)(react_1.screen.getByText('Second Todo')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.vi.mocked(todoService_1.todoService.delete).mockResolvedValueOnce();
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [mockTodos[1]],
                            totalCount: 1,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        deleteButtons = react_1.screen.getAllByRole('button', { name: /delete/i });
                        return [4 /*yield*/, user.click(deleteButtons[0])];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
                                (0, vitest_1.expect)(todoService_1.todoService.delete).toHaveBeenCalledWith(1);
                            })];
                    case 3:
                        _a.sent();
                        // Verify first todo removed
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.queryByText('Test Todo')).not.toBeInTheDocument();
                                (0, vitest_1.expect)(react_1.screen.getByText('Second Todo')).toBeInTheDocument();
                            })];
                    case 4:
                        // Verify first todo removed
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should not delete when confirmation cancelled', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, deleteButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        global.confirm = vitest_1.vi.fn(function () { return false; });
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [mockTodo],
                            totalCount: 1,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.getByText('Test Todo')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        deleteButton = react_1.screen.getByRole('button', { name: /delete/i });
                        return [4 /*yield*/, user.click(deleteButton)];
                    case 2:
                        _a.sent();
                        (0, vitest_1.expect)(global.confirm).toHaveBeenCalled();
                        (0, vitest_1.expect)(todoService_1.todoService.delete).not.toHaveBeenCalled();
                        (0, vitest_1.expect)(react_1.screen.getByText('Test Todo')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Error Handling', function () {
        (0, vitest_1.it)('should handle create error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, titleInput, addButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = user_event_1.default.setup();
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockResolvedValueOnce({
                            items: [],
                            totalCount: 0,
                            page: 1,
                            pageSize: 10,
                            totalPages: 1,
                        });
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.queryByText(/loading/i)).not.toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.vi.mocked(todoService_1.todoService.create).mockRejectedValueOnce(new Error('Network error'));
                        titleInput = react_1.screen.getByPlaceholderText(/todo title/i);
                        return [4 /*yield*/, user.type(titleInput, 'Failed Todo')];
                    case 2:
                        _a.sent();
                        addButton = react_1.screen.getByRole('button', { name: /add todo/i });
                        return [4 /*yield*/, user.click(addButton)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(global.alert).toHaveBeenCalledWith('Failed to create todo');
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle load error gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vitest_1.vi.mocked(todoService_1.todoService.getAll).mockRejectedValueOnce(new Error('Failed to load'));
                        (0, react_1.render)((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(TodoList_1.TodoList, {}) }));
                        // Wait for loading to finish and verify component doesn't crash
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, vitest_1.expect)(react_1.screen.queryByText(/loading/i)).not.toBeInTheDocument();
                            })];
                    case 1:
                        // Wait for loading to finish and verify component doesn't crash
                        _a.sent();
                        // Should show "no todos" message since load failed
                        (0, vitest_1.expect)(react_1.screen.getByText(/no todos found/i)).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
