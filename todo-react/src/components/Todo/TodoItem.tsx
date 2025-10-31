import { useState } from 'react';
import { TodoItem, Category, Tag, TodoPriority } from '../../types';
import { TodoEditModal } from './TodoEditModal';

interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: () => void;
  categories: Category[];
  tags: Tag[];
}

const priorityClasses = {
  [TodoPriority.Low]: 'border-l-gray-500',
  [TodoPriority.Medium]: 'border-l-yellow-400',
  [TodoPriority.High]: 'border-l-orange-500',
  [TodoPriority.Urgent]: 'border-l-red-500',
};

const priorityLabels = {
  [TodoPriority.Low]: 'Low',
  [TodoPriority.Medium]: 'Medium',
  [TodoPriority.High]: 'High',
  [TodoPriority.Urgent]: 'Urgent',
};

const priorityBadgeClasses = {
  [TodoPriority.Low]: 'bg-gray-100 text-gray-800',
  [TodoPriority.Medium]: 'bg-yellow-100 text-yellow-800',
  [TodoPriority.High]: 'bg-orange-100 text-orange-800',
  [TodoPriority.Urgent]: 'bg-red-100 text-red-800',
};

export const TodoItemComponent = ({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  categories,
  tags,
}: TodoItemProps) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !todo.isCompleted;

  return (
    <>
      <div
        className={`bg-gray-50 p-4 rounded-lg border-l-4 ${priorityClasses[todo.priority]} ${
          todo.isCompleted ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={todo.isCompleted}
            onChange={() => onToggle(todo.id)}
            className="mt-1 w-5 h-5 cursor-pointer"
          />
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold ${
                todo.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-gray-600 mt-1">{todo.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  priorityBadgeClasses[todo.priority]
                }`}
              >
                {priorityLabels[todo.priority]}
              </span>
              {todo.category && (
                <span
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{ backgroundColor: todo.category.color + '20', color: todo.category.color }}
                >
                  {todo.category.name}
                </span>
              )}
              {todo.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            {dueDate && (
              <p className={`text-sm mt-2 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                Due: {dueDate.toLocaleString()} {isOverdue && '(OVERDUE!)'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-semibold transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-semibold transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <TodoEditModal
          todo={todo}
          categories={categories}
          tags={tags}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
};
