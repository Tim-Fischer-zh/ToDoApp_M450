import { describe, it, expect, beforeEach, vi } from 'vitest';
import { todoService } from '../../services/todoService';
import apiClient from '../../services/api';
import {
  TodoItem,
  TodoCreateDto,
  TodoUpdateDto,
  TodoPriority,
  PaginatedResponse,
  TodoFilters,
} from '../../types';

vi.mock('../../services/api');

describe('todoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTodoItem: TodoItem = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    isCompleted: false,
    priority: TodoPriority.Medium,
    dueDate: '2025-12-31T23:59:59',
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
    userId: 1,
    categoryId: 1,
    tags: [],
  };

  describe('getAll', () => {
    it('should fetch all todos without filters', async () => {
      const mockResponse: PaginatedResponse<TodoItem> = {
        items: [mockTodoItem],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockResponse,
      } as any);

      const result = await todoService.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/api/todo?');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch todos with filters', async () => {
      const mockFilters: TodoFilters = {
        page: 2,
        pageSize: 20,
        sortBy: 'Priority',
        sortDescending: true,
        isCompleted: false,
        priority: TodoPriority.High,
      };

      const mockResponse: PaginatedResponse<TodoItem> = {
        items: [mockTodoItem],
        totalCount: 1,
        page: 2,
        pageSize: 20,
        totalPages: 1,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockResponse,
      } as any);

      const result = await todoService.getAll(mockFilters);

      expect(apiClient.get).toHaveBeenCalled();
      const callArg = vi.mocked(apiClient.get).mock.calls[0][0] as string;
      expect(callArg).toContain('page=2');
      expect(callArg).toContain('pageSize=20');
      expect(callArg).toContain('sortBy=Priority');
      expect(callArg).toContain('sortDescending=true');
      expect(callArg).toContain('isCompleted=false');
      expect(callArg).toContain('priority=2');
      expect(result).toEqual(mockResponse);
    });

    it('should handle filters with undefined and null values', async () => {
      const mockFilters: TodoFilters = {
        page: 1,
        pageSize: 10,
        categoryId: undefined,
        tagId: undefined,
      };

      const mockResponse: PaginatedResponse<TodoItem> = {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockResponse,
      } as any);

      await todoService.getAll(mockFilters);

      const callArg = vi.mocked(apiClient.get).mock.calls[0][0] as string;
      expect(callArg).not.toContain('categoryId');
      expect(callArg).not.toContain('tagId');
    });
  });

  describe('getById', () => {
    it('should fetch a todo by id', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockTodoItem,
      } as any);

      const result = await todoService.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/api/todo/1');
      expect(result).toEqual(mockTodoItem);
    });

    it('should throw error when todo not found', async () => {
      const mockError = new Error('Todo not found');
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError);

      await expect(todoService.getById(999)).rejects.toThrow('Todo not found');
    });
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const newTodo: TodoCreateDto = {
        title: 'New Todo',
        description: 'New Description',
        isCompleted: false,
        priority: TodoPriority.High,
        dueDate: '2025-12-31T23:59:59',
        categoryId: 1,
        tagIds: [1, 2],
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { ...mockTodoItem, ...newTodo, id: 2 },
      } as any);

      const result = await todoService.create(newTodo);

      expect(apiClient.post).toHaveBeenCalledWith('/api/todo', newTodo);
      expect(result.title).toBe('New Todo');
    });

    it('should handle create error', async () => {
      const newTodo: TodoCreateDto = {
        title: '',
        isCompleted: false,
        priority: TodoPriority.Low,
        tagIds: [],
      };

      const mockError = new Error('Title is required');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(todoService.create(newTodo)).rejects.toThrow('Title is required');
    });
  });

  describe('update', () => {
    it('should update an existing todo', async () => {
      const updateDto: TodoUpdateDto = {
        title: 'Updated Todo',
        description: 'Updated Description',
        isCompleted: true,
        priority: TodoPriority.Urgent,
        tagIds: [3],
      };

      const updatedTodo = { ...mockTodoItem, ...updateDto };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: updatedTodo,
      } as any);

      const result = await todoService.update(1, updateDto);

      expect(apiClient.put).toHaveBeenCalledWith('/api/todo/1', updateDto);
      expect(result.title).toBe('Updated Todo');
      expect(result.isCompleted).toBe(true);
    });

    it('should handle update error', async () => {
      const updateDto: TodoUpdateDto = {
        title: 'Updated Todo',
        isCompleted: false,
        priority: TodoPriority.Low,
        tagIds: [],
      };

      const mockError = new Error('Todo not found');
      vi.mocked(apiClient.put).mockRejectedValueOnce(mockError);

      await expect(todoService.update(999, updateDto)).rejects.toThrow('Todo not found');
    });
  });

  describe('toggle', () => {
    it('should toggle todo completion status', async () => {
      vi.mocked(apiClient.patch).mockResolvedValueOnce({} as any);

      await todoService.toggle(1);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/todo/1/toggle');
    });

    it('should handle toggle error', async () => {
      const mockError = new Error('Todo not found');
      vi.mocked(apiClient.patch).mockRejectedValueOnce(mockError);

      await expect(todoService.toggle(999)).rejects.toThrow('Todo not found');
    });
  });

  describe('delete', () => {
    it('should delete a todo', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({} as any);

      await todoService.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/todo/1');
    });

    it('should handle delete error', async () => {
      const mockError = new Error('Todo not found');
      vi.mocked(apiClient.delete).mockRejectedValueOnce(mockError);

      await expect(todoService.delete(999)).rejects.toThrow('Todo not found');
    });
  });

  describe('search', () => {
    it('should search todos by search term', async () => {
      const searchResults = [mockTodoItem, { ...mockTodoItem, id: 2, title: 'Another Test' }];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: searchResults,
      } as any);

      const result = await todoService.search('test');

      expect(apiClient.get).toHaveBeenCalledWith('/api/todo/search?searchTerm=test');
      expect(result).toEqual(searchResults);
    });

    it('should return empty array when no results found', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: [],
      } as any);

      const result = await todoService.search('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
