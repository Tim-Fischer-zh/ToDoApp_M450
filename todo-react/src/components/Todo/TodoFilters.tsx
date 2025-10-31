import { TodoFilters, TodoPriority, Category } from '../../types';

interface TodoFiltersProps {
  filters: TodoFilters;
  categories: Category[];
  onFilterChange: (filters: Partial<TodoFilters>) => void;
}

export const TodoFiltersComponent = ({ filters, categories, onFilterChange }: TodoFiltersProps) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Filters & Search</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search..."
            value={filters.searchTerm || ''}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value || undefined })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={filters.isCompleted === undefined ? '' : filters.isCompleted.toString()}
            onChange={(e) =>
              onFilterChange({
                isCompleted: e.target.value === '' ? undefined : e.target.value === 'true',
              })
            }
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Completed</option>
          </select>
        </div>

        <div>
          <select
            value={filters.categoryId || ''}
            onChange={(e) =>
              onFilterChange({ categoryId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.priority === undefined ? '' : filters.priority.toString()}
            onChange={(e) =>
              onFilterChange({
                priority: e.target.value === '' ? undefined : (Number(e.target.value) as TodoPriority),
              })
            }
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value={TodoPriority.Low}>Low</option>
            <option value={TodoPriority.Medium}>Medium</option>
            <option value={TodoPriority.High}>High</option>
            <option value={TodoPriority.Urgent}>Urgent</option>
          </select>
        </div>

        <div>
          <select
            value={filters.sortBy || 'CreatedAt'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="CreatedAt">Sort by Date</option>
            <option value="Priority">Sort by Priority</option>
            <option value="DueDate">Sort by Due Date</option>
            <option value="Title">Sort by Title</option>
          </select>
        </div>

        <div>
          <select
            value={filters.sortDescending ? 'true' : 'false'}
            onChange={(e) => onFilterChange({ sortDescending: e.target.value === 'true' })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="true">Descending</option>
            <option value="false">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
};
