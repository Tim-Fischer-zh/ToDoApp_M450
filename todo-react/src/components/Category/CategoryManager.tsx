import { useState, useEffect } from 'react';
import { Category } from '../../types';
import { categoryService } from '../../services/categoryService';

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await categoryService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });

      setName('');
      setDescription('');
      setColor('#3B82F6');
      loadCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Todos will not be deleted.')) return;

    try {
      await categoryService.delete(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Add Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 resize-vertical min-h-20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No categories yet. Create one above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-50 p-4 rounded-lg border-l-4"
              style={{ borderLeftColor: category.color }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{category.name}</h4>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-semibold transition"
                >
                  Delete
                </button>
              </div>
              {category.description && (
                <p className="text-gray-600 text-sm">{category.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
