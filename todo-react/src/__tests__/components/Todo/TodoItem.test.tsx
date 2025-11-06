import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItemComponent } from '../../../components/Todo/TodoItem';
import { TodoItem, TodoPriority, Category, Tag } from '../../../types';

// Mock TodoEditModal component
vi.mock('../../../components/Todo/TodoEditModal', () => ({
  TodoEditModal: ({ onClose, onSuccess }: any) => (
    <div data-testid="edit-modal">
      <button onClick={onSuccess}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('TodoItemComponent', () => {
  const mockTodo: TodoItem = {
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
    category: {
      id: 1,
      name: 'Work',
      color: '#3B82F6',
      userId: 1,
    },
    tags: [
      { id: 1, name: 'Important', color: '#EF4444', userId: 1 },
      { id: 2, name: 'Urgent', color: '#F59E0B', userId: 1 },
    ],
  };

  const mockCategories: Category[] = [
    { id: 1, name: 'Work', color: '#3B82F6', userId: 1 },
    { id: 2, name: 'Personal', color: '#10B981', userId: 1 },
  ];

  const mockTags: Tag[] = [
    { id: 1, name: 'Important', color: '#EF4444', userId: 1 },
    { id: 2, name: 'Urgent', color: '#F59E0B', userId: 1 },
  ];

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  const renderTodoItem = (todo: TodoItem = mockTodo) => {
    return render(
      <TodoItemComponent
        todo={todo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        categories={mockCategories}
        tags={mockTags}
      />
    );
  };

  it('should render todo item with all details', () => {
    renderTodoItem();

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('should render todo without optional fields', () => {
    const minimalTodo: TodoItem = {
      ...mockTodo,
      description: undefined,
      category: undefined,
      tags: [],
      dueDate: undefined,
    };

    renderTodoItem(minimalTodo);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should display checkbox with correct checked state', () => {
    const { container } = renderTodoItem();

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(false);
  });

  it('should call onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderTodoItem();

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith(1);
  });

  it('should display completed todo with line-through style', () => {
    const completedTodo: TodoItem = {
      ...mockTodo,
      isCompleted: true,
    };

    renderTodoItem(completedTodo);

    const title = screen.getByText('Test Todo');
    expect(title).toHaveClass('line-through');
  });

  it('should display priority badge with correct styling', () => {
    renderTodoItem();

    const priorityBadge = screen.getByText('Medium');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should render different priority levels correctly', () => {
    const todoWithoutUrgentTag = { ...mockTodo, tags: [] }; // Remove tag to avoid collision

    const { rerender } = renderTodoItem({ ...todoWithoutUrgentTag, priority: TodoPriority.Low });
    expect(screen.getByText('Low')).toBeInTheDocument();

    rerender(
      <TodoItemComponent
        todo={{ ...todoWithoutUrgentTag, priority: TodoPriority.High }}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        categories={mockCategories}
        tags={mockTags}
      />
    );
    expect(screen.getByText('High')).toBeInTheDocument();

    rerender(
      <TodoItemComponent
        todo={{ ...todoWithoutUrgentTag, priority: TodoPriority.Urgent }}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        categories={mockCategories}
        tags={mockTags}
      />
    );
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('should display due date when present', () => {
    renderTodoItem();

    expect(screen.getByText(/Due:/)).toBeInTheDocument();
  });

  it('should mark overdue todos', () => {
    const overdueTodo: TodoItem = {
      ...mockTodo,
      dueDate: '2020-01-01T00:00:00', // Past date
      isCompleted: false,
    };

    renderTodoItem(overdueTodo);

    expect(screen.getByText(/OVERDUE!/)).toBeInTheDocument();
  });

  it('should not mark completed todos as overdue', () => {
    const overdueTodo: TodoItem = {
      ...mockTodo,
      dueDate: '2020-01-01T00:00:00',
      isCompleted: true,
    };

    renderTodoItem(overdueTodo);

    expect(screen.queryByText(/OVERDUE!/)).not.toBeInTheDocument();
  });

  it('should render category with custom color', () => {
    renderTodoItem();

    const categoryBadge = screen.getByText('Work');
    expect(categoryBadge).toBeInTheDocument();
  });

  it('should render multiple tags', () => {
    renderTodoItem();

    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('should show edit button', () => {
    renderTodoItem();

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    renderTodoItem();

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should open edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderTodoItem();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('should close edit modal and call onUpdate when save is clicked', async () => {
    const user = userEvent.setup();
    renderTodoItem();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderTodoItem();

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('should have correct priority border color', () => {
    const { container } = renderTodoItem({ ...mockTodo, priority: TodoPriority.Urgent });

    const todoCard = container.querySelector('.border-l-4');
    expect(todoCard).toHaveClass('border-l-red-500');
  });

  it('should have reduced opacity when completed', () => {
    const { container } = renderTodoItem({ ...mockTodo, isCompleted: true });

    const todoCard = container.querySelector('.opacity-60');
    expect(todoCard).toBeInTheDocument();
  });
});
