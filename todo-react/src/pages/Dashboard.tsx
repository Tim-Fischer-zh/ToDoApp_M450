import { useState } from 'react';
import { AppLayout } from '../components/Layout/AppLayout';
import { TodoList } from '../components/Todo/TodoList';
import { CategoryManager } from '../components/Category/CategoryManager';
import { TagManager } from '../components/Tag/TagManager';

type Tab = 'todos' | 'categories' | 'tags';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('todos');

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex gap-2 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-6 py-3 font-semibold transition border-b-3 ${
              activeTab === 'todos'
                ? 'text-indigo-600 border-indigo-600 border-b-4'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 font-semibold transition border-b-3 ${
              activeTab === 'categories'
                ? 'text-indigo-600 border-indigo-600 border-b-4'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-6 py-3 font-semibold transition border-b-3 ${
              activeTab === 'tags'
                ? 'text-indigo-600 border-indigo-600 border-b-4'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Tags
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'todos' && <TodoList />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'tags' && <TagManager />}
      </div>
    </AppLayout>
  );
};
