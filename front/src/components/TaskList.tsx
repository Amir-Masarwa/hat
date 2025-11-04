import React, { useState, useMemo } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  userId: number;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskListProps {
  tasks: Task[];
  users: User[];
  selectedUserId: number | null;
  onTaskUpdate: () => void;
  onTaskDelete: () => void;
}

type SortOption = 'newest' | 'oldest' | 'alphabetical';

const ITEMS_PER_PAGE = 5;

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  users,
  selectedUserId,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<Partial<Task>>({});
  const [editError, setEditError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchId, setSearchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditFields({
      title: task.title,
      description: task.description,
      userId: task.userId,
      completed: task.completed,
    });
  };

  const handleEditFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditFields((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleEditSave = async (taskId: number) => {
    setEditError('');
    
    if (!editFields.title || editFields.title.trim().length < 3) {
      setEditError('Title must be at least 3 characters');
      return;
    }
    
    try {
      await api.patch(`/tasks/${taskId}`, editFields);
      setEditingTaskId(null);
      setEditFields({});
      setEditError('');
      onTaskUpdate();
    } catch (error: any) {
      setEditError(error?.response?.data?.message || 'Failed to save task update.');
    }
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditFields({});
    setEditError('');
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await api.patch(`/tasks/${task.id}`, {
        completed: !task.completed,
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        onTaskDelete();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || user?.email || 'Unknown';
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by ID if search is active
    if (searchId) {
      const id = parseInt(searchId);
      if (!isNaN(id)) {
        result = result.filter(task => task.id === id);
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'oldest':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [tasks, sortBy, searchId]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

  // Reset to page 1 when search or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchId, sortBy]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">
          My Tasks
        </h2>
      </div>
      
      <div className="p-6">
        {/* Controls: Search and Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Search by ID
            </label>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter task ID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="sm:w-48">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A → Z</option>
            </select>
          </div>
        </div>

        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {searchId ? '🔍' : '📝'}
            </div>
            <p className="text-gray-500 text-lg">
              {searchId ? 'No task found with that ID' : 'No tasks yet!'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchId ? 'Try a different ID' : 'Create your first task below to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Task count and page info */}
            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedTasks.length)} of {filteredAndSortedTasks.length} tasks
              </span>
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <div className="space-y-3">
              {paginatedTasks.map((task) => (
              <div
                key={task.id}
                className={`group border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                  task.completed 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-blue-200 hover:border-blue-300'
                }`}
              >
                {editingTaskId === task.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditSave(task.id);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <input
                        name="title"
                        value={editFields.title || ''}
                        onChange={handleEditFieldChange}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          editError && (!editFields.title || editFields.title.trim().length < 3)
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Task title"
                      />
                      {editError && (!editFields.title || editFields.title.trim().length < 3) && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <span>⚠</span>
                          {editError}
                        </p>
                      )}
                    </div>
                    <textarea
                      name="description"
                      value={editFields.description || ''}
                      onChange={handleEditFieldChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="completed"
                        checked={!!editFields.completed}
                        onChange={handleEditFieldChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-700">Mark as completed</label>
                    </div>
                    {editError && editFields.title && editFields.title.trim().length >= 3 && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                        {editError}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          #{task.id}
                        </span>
                        <h3
                          className={`font-semibold text-gray-900 ${
                            task.completed ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.completed ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {task.createdAt && new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskList;
