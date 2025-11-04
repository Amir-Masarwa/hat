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
  const [errors, setErrors] = useState({ title: '', general: '' });
  const [touched, setTouched] = useState({ title: false });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateTitle = (value: string) => {
    if (!value.trim()) return 'Task title is required';
    if (value.length < 3) return 'Title must be at least 3 characters';
    if (value.length > 100) return 'Title must be less than 100 characters';
    return '';
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (touched.title) {
      setErrors(prev => ({ ...prev, title: validateTitle(value) }));
    }
  };

  const handleBlur = () => {
    setTouched({ title: true });
    setErrors(prev => ({ ...prev, title: validateTitle(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ title: true });
    const titleError = validateTitle(title);
    
    if (titleError) {
      setErrors({ title: titleError, general: '' });
      return;
    }

    setErrors({ title: '', general: '' });
    setLoading(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        completed: false,
      });
      setTitle('');
      setDescription('');
      setTouched({ title: false });
      
      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      onTaskCreated();
    } catch (error: any) {
      console.error('Error creating task:', error);
      setErrors(prev => ({
        ...prev,
        general: error?.response?.data?.message || 'Error creating task. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">Task created successfully!</span>
          </div>
        </div>
      )}
      
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
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleBlur}
              required
              disabled={loading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 ${
                errors.title && touched.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="What needs to be done?"
            />
            {errors.title && touched.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span>
                {errors.title}
              </p>
            )}
            {!errors.title && title && (
              <p className="mt-1 text-xs text-gray-500">
                {title.length}/100 characters
              </p>
            )}
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
            {description && (
              <p className="mt-1 text-xs text-gray-500">
                {description.length} characters
              </p>
            )}
          </div>
          
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !title || !!errors.title}
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
