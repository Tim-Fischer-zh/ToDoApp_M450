import { useState, useEffect } from 'react';
import { Tag } from '../../types';
import { tagService } from '../../services/tagService';

export const TagManager = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await tagService.getAll();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await tagService.create({
        name: name.trim(),
        color,
      });

      setName('');
      setColor('#6B7280');
      loadTags();
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert('Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tag? It will be removed from all todos.')) return;

    try {
      await tagService.delete(id);
      loadTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('Failed to delete tag');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Add Tag</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tag name"
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Tag'}
          </button>
        </form>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No tags yet. Create one above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-gray-50 p-4 rounded-lg border-l-4"
              style={{ borderLeftColor: tag.color }}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">{tag.name}</h4>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
