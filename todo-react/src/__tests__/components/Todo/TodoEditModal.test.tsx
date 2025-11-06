import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoEditModal } from '../../../components/Todo/TodoEditModal';
import { todoService } from '../../../services/todoService';
import { TodoItem, TodoPriority, Category, Tag } from '../../../types';

vi.mock('../../../services/todoService');

describe('TodoEditModal', () => {
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
    tags: [
      { id: 1, name: 'Important', color: '#EF4444', userId: 1 },
    ],
  };

  const mockCategories: Category[] = [
    { id: 1, name: 'Work', color: '#3B82F6', userId: 1 },
    { id: 2, name: 'Personal', color: '#10B981', userId: 1 },
  ];

  const mockTags: Tag[] = [
    { id: 1, name: 'Important', color: '#EF4444', userId: 1 },
    { id: 2, name: 'Urgent', color: '#F59E0B', userId: 1 },
    { id: 3, name: 'Later', color: '#6B7280', userId: 1 },
  ];

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
  });

  const renderEditModal = (todo: TodoItem = mockTodo) => {
    return render(
      <TodoEditModal
        todo={todo}
        categories={mockCategories}
        tags={mockTags}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
  };

  it('should render edit modal with todo data', () => {
    const { container } = renderEditModal();

    expect(screen.getByText('Edit Todo')).toBeInTheDocument();

    const titleInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(titleInput.value).toBe('Test Todo');

    const descriptionInput = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('Test Description');
  });

  it('should render modal backdrop', () => {
    const { container } = renderEditModal();

    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass('bg-black', 'bg-opacity-50');
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    renderEditModal();

    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderEditModal();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should update title field', async () => {
    const user = userEvent.setup();
    const { container } = renderEditModal();

    const titleInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    expect(titleInput.value).toBe('Updated Title');
  });

  it('should update description field', async () => {
    const user = userEvent.setup();
    const { container } = renderEditModal();

    const descriptionInput = container.querySelector('textarea') as HTMLTextAreaElement;
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');

    expect(descriptionInput.value).toBe('Updated Description');
  });

  it('should update priority selection', async () => {
    const user = userEvent.setup();
    const { container } = renderEditModal();

    const prioritySelect = container.querySelector('select') as HTMLSelectElement;
    await user.selectOptions(prioritySelect, TodoPriority.Urgent.toString());

    expect(prioritySelect.value).toBe(TodoPriority.Urgent.toString());
  });

  it('should render all priority options', () => {
    const { container } = renderEditModal();

    const prioritySelect = container.querySelector('select') as HTMLSelectElement;
    const options = Array.from(prioritySelect.options).map((opt) => opt.text);

    expect(options).toContain('Low');
    expect(options).toContain('Medium');
    expect(options).toContain('High');
    expect(options).toContain('Urgent');
  });

  it('should update due date', async () => {
    const user = userEvent.setup();
    const { container } = renderEditModal();

    const dueDateInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    await user.clear(dueDateInput);
    await user.type(dueDateInput, '2026-01-15T14:30');

    expect(dueDateInput.value).toBe('2026-01-15T14:30');
  });

  it('should render category dropdown with all categories', () => {
    renderEditModal();

    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('No Category')).toBeInTheDocument();
  });

  it('should render tag checkboxes with correct initial state', () => {
    const { container } = renderEditModal();

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3);

    const importantCheckbox = Array.from(checkboxes).find((cb) => {
      const label = cb.closest('label');
      return label?.textContent?.includes('Important');
    }) as HTMLInputElement;

    expect(importantCheckbox.checked).toBe(true);
  });

  it('should toggle tag selection', async () => {
    const user = userEvent.setup();
    const { container } = renderEditModal();

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const urgentCheckbox = Array.from(checkboxes).find((cb) => {
      const label = cb.closest('label');
      return label?.textContent?.includes('Urgent');
    }) as HTMLInputElement;

    expect(urgentCheckbox.checked).toBe(false);

    await user.click(urgentCheckbox);

    expect(urgentCheckbox.checked).toBe(true);
  });

  it('should successfully update todo on form submit', async () => {
    const user = userEvent.setup();
    const updatedTodo = { ...mockTodo, title: 'Updated Title' };

    vi.mocked(todoService.update).mockResolvedValueOnce(updatedTodo);

    const { container } = renderEditModal();

    const titleInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(todoService.update).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Updated Title',
        description: 'Test Description',
        priority: TodoPriority.Medium,
        isCompleted: false,
        tagIds: [1],
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should show loading state during save', async () => {
    const user = userEvent.setup();

    vi.mocked(todoService.update).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderEditModal();

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('should handle update error', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Update failed');

    vi.mocked(todoService.update).mockRejectedValueOnce(mockError);

    renderEditModal();

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to update todo');
    });

    // Check after waitFor to ensure no race condition
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should not submit when title is empty', async () => {
    const user = userEvent.setup();
    const { container } = renderEditModal();

    const titleInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await user.clear(titleInput);

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveButton);

    expect(todoService.update).not.toHaveBeenCalled();
  });

  it('should trim whitespace from title and description', async () => {
    const user = userEvent.setup();

    vi.mocked(todoService.update).mockResolvedValueOnce(mockTodo);

    const { container } = renderEditModal();

    const titleInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, '  Trimmed Title  ');

    const descriptionInput = container.querySelector('textarea') as HTMLTextAreaElement;
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '  Trimmed Description  ');

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(todoService.update).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Trimmed Title',
        description: 'Trimmed Description',
      }));
    });
  });

  it('should handle empty description by converting to undefined', async () => {
    const user = userEvent.setup();

    vi.mocked(todoService.update).mockResolvedValueOnce(mockTodo);

    const { container } = renderEditModal();

    const descriptionInput = container.querySelector('textarea') as HTMLTextAreaElement;
    await user.clear(descriptionInput);

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(todoService.update).toHaveBeenCalledWith(1, expect.objectContaining({
        description: undefined,
      }));
    });
  });

  it('should display "No tags available" when tags array is empty', () => {
    render(
      <TodoEditModal
        todo={mockTodo}
        categories={mockCategories}
        tags={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('No tags available')).toBeInTheDocument();
  });

  it('should preserve isCompleted status during update', async () => {
    const user = userEvent.setup();
    const completedTodo = { ...mockTodo, isCompleted: true };

    vi.mocked(todoService.update).mockResolvedValueOnce(completedTodo);

    renderEditModal(completedTodo);

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(todoService.update).toHaveBeenCalledWith(1, expect.objectContaining({
        isCompleted: true,
      }));
    });
  });

  it('should format due date correctly for datetime-local input', () => {
    const { container } = renderEditModal();

    const dueDateInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    // Should be in format YYYY-MM-DDTHH:mm
    expect(dueDateInput.value).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  });
});
