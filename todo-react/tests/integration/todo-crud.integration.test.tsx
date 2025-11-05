import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TodoList } from '../../src/components/Todo/TodoList';
import { todoService } from '../../src/services/todoService';
import { categoryService } from '../../src/services/categoryService';
import { tagService } from '../../src/services/tagService';
import { TodoItem, TodoPriority } from '../../src/types';

vi.mock('../../src/services/todoService');
vi.mock('../../src/services/categoryService');
vi.mock('../../src/services/tagService');

describe('Todo CRUD Integration Tests', () => {
  const mockTodo: TodoItem = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    isCompleted: false,
    priority: TodoPriority.Medium,
    dueDate: '2025-12-31T23:59:00',
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
    userId: 1,
    categoryId: 1,
    tags: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);
    global.alert = vi.fn();

    // Mock category and tag services
    vi.mocked(categoryService.getAll).mockResolvedValue([
      { id: 1, name: 'Work', color: '#3B82F6', userId: 1 },
    ]);
    vi.mocked(tagService.getAll).mockResolvedValue([
      { id: 1, name: 'Important', color: '#EF4444', userId: 1 },
    ]);
  });

  describe('Load and Display Todos', () => {
    it('should load and display todos', async () => {
      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [mockTodo],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should handle empty todo list', async () => {
      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no todos found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Create Todo', () => {
    it('should create a new todo', async () => {
      const user = userEvent.setup();

      // Initial empty list
      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const newTodo: TodoItem = {
        ...mockTodo,
        id: 2,
        title: 'New Todo',
      };

      // Mock create and reload
      vi.mocked(todoService.create).mockResolvedValueOnce(newTodo);
      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [newTodo],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      // Fill form
      const titleInput = screen.getByPlaceholderText(/todo title/i);
      await user.type(titleInput, 'New Todo');

      // Submit
      const addButton = screen.getByRole('button', { name: /add todo/i });
      await user.click(addButton);

      // Verify API call
      await waitFor(() => {
        expect(todoService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Todo',
            isCompleted: false,
          })
        );
      });

      // Verify todo appears
      await waitFor(() => {
        expect(screen.getByText('New Todo')).toBeInTheDocument();
      });
    });
  });

  describe('Update Todo', () => {
    it('should toggle todo completion', async () => {
      const user = userEvent.setup();

      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [mockTodo],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const completedTodo = { ...mockTodo, isCompleted: true };

      // Mock toggle and reload
      vi.mocked(todoService.toggle).mockResolvedValueOnce();
      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [completedTodo],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      // Click checkbox - get all checkboxes and find the one in the todo item (not in form)
      const checkboxes = screen.getAllByRole('checkbox');
      // The todo item checkbox is the last one (form has tag checkboxes first)
      const todoCheckbox = checkboxes[checkboxes.length - 1];
      await user.click(todoCheckbox);

      await waitFor(() => {
        expect(todoService.toggle).toHaveBeenCalledWith(1);
      });
    });

    it('should edit todo via modal', async () => {
      const user = userEvent.setup();

      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [mockTodo],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Click edit
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByText('Edit Todo')).toBeInTheDocument();
      });

      const updatedTodo = { ...mockTodo, title: 'Updated Todo' };

      vi.mocked(todoService.update).mockResolvedValueOnce(updatedTodo);
      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [updatedTodo],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      // Update title
      const titleInput = screen.getByDisplayValue('Test Todo');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Todo');

      // Save
      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(todoService.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            title: 'Updated Todo',
          })
        );
      });

      // Verify updated todo appears
      await waitFor(() => {
        expect(screen.getByText('Updated Todo')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Todo', () => {
    it('should delete todo', async () => {
      const user = userEvent.setup();

      const mockTodos = [mockTodo, { ...mockTodo, id: 2, title: 'Second Todo' }];

      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: mockTodos,
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
        expect(screen.getByText('Second Todo')).toBeInTheDocument();
      });

      vi.mocked(todoService.delete).mockResolvedValueOnce();
      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [mockTodos[1]],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      // Click delete on first todo
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
        expect(todoService.delete).toHaveBeenCalledWith(1);
      });

      // Verify first todo removed
      await waitFor(() => {
        expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
        expect(screen.getByText('Second Todo')).toBeInTheDocument();
      });
    });

    it('should not delete when confirmation cancelled', async () => {
      const user = userEvent.setup();
      global.confirm = vi.fn(() => false);

      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [mockTodo],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(global.confirm).toHaveBeenCalled();
      expect(todoService.delete).not.toHaveBeenCalled();
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle create error', async () => {
      const user = userEvent.setup();

      vi.mocked(todoService.getAll).mockResolvedValueOnce({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      vi.mocked(todoService.create).mockRejectedValueOnce(new Error('Network error'));

      const titleInput = screen.getByPlaceholderText(/todo title/i);
      await user.type(titleInput, 'Failed Todo');

      const addButton = screen.getByRole('button', { name: /add todo/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to create todo');
      });
    });

    it('should handle load error gracefully', async () => {
      vi.mocked(todoService.getAll).mockRejectedValueOnce(new Error('Failed to load'));

      render(
        <BrowserRouter>
          <TodoList />
        </BrowserRouter>
      );

      // Wait for loading to finish and verify component doesn't crash
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Should show "no todos" message since load failed
      expect(screen.getByText(/no todos found/i)).toBeInTheDocument();
    });
  });
});
