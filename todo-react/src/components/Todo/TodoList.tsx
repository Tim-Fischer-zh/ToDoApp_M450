import { useState, useEffect } from 'react';
import { TodoItem, TodoFilters, Category, Tag } from '../../types';
import { todoService } from '../../services/todoService';
import { categoryService } from '../../services/categoryService';
import { tagService } from '../../services/tagService';
import { TodoItemComponent } from './TodoItem';
import { TodoForm } from './TodoForm';
import { TodoFiltersComponent } from './TodoFilters';

export const TodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<TodoFilters>({
    page: 1,
    pageSize: 10,
    sortBy: 'CreatedAt',
    sortDescending: true,
  });

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  useEffect(() => {
    loadTodos();
  }, [filters]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await todoService.getAll(filters);
      setTodos(response.items);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const data = await tagService.getAll();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await todoService.toggle(id);
      loadTodos();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      await todoService.delete(id);
      loadTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleFilterChange = (newFilters: Partial<TodoFilters>) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (loading && todos.length === 0) {
    return <div className="text-center py-8">Loading todos...</div>;
  }

  return (
    <div className="space-y-6">
      <TodoForm
        onSuccess={loadTodos}
        categories={categories}
        tags={tags}
        onCategoriesChange={loadCategories}
        onTagsChange={loadTags}
      />

      <TodoFiltersComponent
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
      />

      {todos.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No todos found. Create one above!
        </div>
      ) : (
        <div className="space-y-4">
          {todos.map((todo) => (
            <TodoItemComponent
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={loadTodos}
              categories={categories}
              tags={tags}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:bg-gray-400 transition"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:bg-gray-400 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
