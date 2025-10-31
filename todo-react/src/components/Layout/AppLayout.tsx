import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">My Todos</h1>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">{user?.username}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-6">{children}</div>
      </div>
    </div>
  );
};
