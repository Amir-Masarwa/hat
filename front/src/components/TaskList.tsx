import React, { useState } from 'react';
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

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  users,
  selectedUserId,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<Partial<Task>>({});

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
    try {
      await api.patch(`/tasks/${taskId}`, editFields);
      setEditingTaskId(null);
      setEditFields({});
      onTaskUpdate();
    } catch (error) {
      alert('Failed to save task update.');
    }
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditFields({});
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">
          My Tasks
        </h2>
      </div>
      
      <div className="p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">No tasks yet!</p>
            <p className="text-gray-400 text-sm mt-2">Create your first task below to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
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
                    <input
                      name="title"
                      value={editFields.title || ''}
                      onChange={handleEditFieldChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Task title"
                    />
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
                      <h3
                        className={`font-semibold text-gray-900 ${
                          task.completed ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.completed ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(task.createdAt || Date.now()).toLocaleDateString()}
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
        )}
      </div>
    </div>
  );
};

export default TaskList;
