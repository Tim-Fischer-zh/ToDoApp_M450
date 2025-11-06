import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from '../../../components/Todo/TodoList';
import { todoService } from '../../../services/todoService';
import { categoryService } from '../../../services/categoryService';
import { tagService } from '../../../services/tagService';
import { TodoItem, TodoPriority, PaginatedResponse } from '../../../types';

vi.mock('../../../services/todoService');
vi.mock('../../../services/categoryService');
vi.mock('../../../services/tagService');

// Mock child components
vi.mock('../../../components/Todo/TodoItem', () => ({
  TodoItemComponent: ({ todo, onToggle, onDelete }: any) => (
    <div data-testid={`todo-item-${todo.id}`}>
      <span>{todo.title}</span>
      <button onClick={() => onToggle(todo.id)}>Toggle</button>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  ),
}));

vi.mock('../../../components/Todo/TodoForm', () => ({
  TodoForm: ({ onSuccess }: any) => (
    <div data-testid="todo-form">
      <button onClick={onSuccess}>Create Todo</button>
    </div>
  ),
}));

vi.mock('../../../components/Todo/TodoFilters', () => ({
  TodoFiltersComponent: ({ onFilterChange }: any) => (
    <div data-testid="todo-filters">
      <button onClick={() => onFilterChange({ isCompleted: true })}>Show Completed</button>
    </div>
  ),
}));

describe('TodoList Component', () => {
  const mockTodos: TodoItem[] = [
    {
      id: 1,
      title: 'First Todo',
      description: 'First Description',
      isCompleted: false,
      priority: TodoPriority.High,
      createdAt: '2025-01-01T00:00:00',
      updatedAt: '2025-01-01T00:00:00',
      userId: 1,
      tags: [],
    },
    {
      id: 2,
      title: 'Second Todo',
      description: 'Second Description',
      isCompleted: true,
      priority: TodoPriority.Low,
      createdAt: '2025-01-02T00:00:00',
      updatedAt: '2025-01-02T00:00:00',
      userId: 1,
      tags: [],
    },
  ];

  const mockPaginatedResponse: PaginatedResponse<TodoItem> = {
    items: mockTodos,
    totalCount: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);

    vi.mocked(categoryService.getAll).mockResolvedValue([]);
    vi.mocked(tagService.getAll).mockResolvedValue([]);
    vi.mocked(todoService.getAll).mockResolvedValue(mockPaginatedResponse);
  });

  it('should show loading state initially', () => {
    vi.mocked(todoService.getAll).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<TodoList />);

    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  it('should load and display todos', async () => {
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    });

    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
  });

  it('should call todoService.getAll on mount', async () => {
    render(<TodoList />);

    await waitFor(() => {
      expect(todoService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 10,
          sortBy: 'CreatedAt',
          sortDescending: true,
        })
      );
    });
  });

  it('should load categories and tags on mount', async () => {
    render(<TodoList />);

    await waitFor(() => {
      expect(categoryService.getAll).toHaveBeenCalled();
      expect(tagService.getAll).toHaveBeenCalled();
    });
  });

  it('should display empty state when no todos', async () => {
    vi.mocked(todoService.getAll).mockResolvedValueOnce({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('No todos found. Create one above!')).toBeInTheDocument();
    });
  });

  it('should toggle todo completion', async () => {
    const user = userEvent.setup();
    vi.mocked(todoService.toggle).mockResolvedValueOnce();

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByText('Toggle');
    await user.click(toggleButtons[0]);

    await waitFor(() => {
      expect(todoService.toggle).toHaveBeenCalledWith(1);
      // Should reload todos after toggle
      expect(todoService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  it('should delete todo when confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(todoService.delete).mockResolvedValueOnce();

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
      expect(todoService.delete).toHaveBeenCalledWith(1);
      // Should reload todos after delete
      expect(todoService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  it('should not delete todo when not confirmed', async () => {
    const user = userEvent.setup();
    global.confirm = vi.fn(() => false);

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(todoService.delete).not.toHaveBeenCalled();
  });

  it('should reload todos when filter changes', async () => {
    const user = userEvent.setup();

    render(<TodoList />);

    await waitFor(() => {
      expect(todoService.getAll).toHaveBeenCalledTimes(1);
    });

    const filterButton = screen.getByText('Show Completed');
    await user.click(filterButton);

    await waitFor(() => {
      // Should be called again with new filters
      expect(todoService.getAll).toHaveBeenCalledTimes(2);
      expect(todoService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isCompleted: true,
          page: 1, // Should reset to page 1
        })
      );
    });
  });

  it('should reload todos when form submission succeeds', async () => {
    const user = userEvent.setup();

    render(<TodoList />);

    await waitFor(() => {
      expect(todoService.getAll).toHaveBeenCalledTimes(1);
    });

    const createButton = screen.getByText('Create Todo');
    await user.click(createButton);

    await waitFor(() => {
      expect(todoService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  it('should display pagination controls when multiple pages', async () => {
    const multiPageResponse: PaginatedResponse<TodoItem> = {
      items: mockTodos,
      totalCount: 25,
      page: 1,
      pageSize: 10,
      totalPages: 3,
    };

    vi.mocked(todoService.getAll).mockResolvedValueOnce(multiPageResponse);

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      expect(screen.getByText(/25 total/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  it('should not display pagination when only one page', async () => {
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });
  });

  it('should navigate to next page', async () => {
    const user = userEvent.setup();
    const multiPageResponse: PaginatedResponse<TodoItem> = {
      items: mockTodos,
      totalCount: 25,
      page: 1,
      pageSize: 10,
      totalPages: 3,
    };

    vi.mocked(todoService.getAll).mockResolvedValueOnce(multiPageResponse);

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(todoService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  it('should navigate to previous page', async () => {
    const user = userEvent.setup();
    const page2Response: PaginatedResponse<TodoItem> = {
      items: mockTodos,
      totalCount: 25,
      page: 2,
      pageSize: 10,
      totalPages: 3,
    };

    vi.mocked(todoService.getAll).mockResolvedValueOnce(page2Response);

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    await waitFor(() => {
      expect(todoService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
        })
      );
    });
  });

  it('should disable previous button on first page', async () => {
    const multiPageResponse: PaginatedResponse<TodoItem> = {
      items: mockTodos,
      totalCount: 25,
      page: 1,
      pageSize: 10,
      totalPages: 3,
    };

    vi.mocked(todoService.getAll).mockResolvedValueOnce(multiPageResponse);

    render(<TodoList />);

    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });
  });

  it('should disable next button on last page', async () => {
    const lastPageResponse: PaginatedResponse<TodoItem> = {
      items: mockTodos,
      totalCount: 25,
      page: 3,
      pageSize: 10,
      totalPages: 3,
    };

    vi.mocked(todoService.getAll).mockResolvedValueOnce(lastPageResponse);

    render(<TodoList />);

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  it('should handle errors when loading todos', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(todoService.getAll).mockRejectedValueOnce(new Error('Failed to load'));

    render(<TodoList />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load todos:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle errors when loading categories', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(categoryService.getAll).mockRejectedValueOnce(new Error('Failed to load'));

    render(<TodoList />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load categories:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle errors when toggling todo', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(todoService.toggle).mockRejectedValueOnce(new Error('Toggle failed'));

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByText('Toggle');
    await user.click(toggleButtons[0]);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to toggle todo:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
