import React, { useState } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface TaskFormProps {
  users: User[];
  selectedUserId: number | null;
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  users,
  selectedUserId,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        completed: false,
      });
      setTitle('');
      setDescription('');
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>➕</span>
          Create New Task
        </h2>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
              placeholder="What needs to be done?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none disabled:bg-gray-100"
              placeholder="Add more details..."
              rows={3}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !title}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>➕</span>
                Create Task
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
