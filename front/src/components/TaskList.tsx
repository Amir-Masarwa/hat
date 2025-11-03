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
    <div className="card">
      <h2>
        {selectedUserId
          ? `Tasks for ${getUserName(selectedUserId)}`
          : 'All Tasks'}
      </h2>
      {tasks.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          No tasks found. Create a new task below!
        </p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
          >
            {editingTaskId === task.id ? (
              <form
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}
                onSubmit={e => { e.preventDefault(); handleEditSave(task.id); }}
              >
                <input
                  name="title"
                  value={editFields.title || ''}
                  onChange={handleEditFieldChange}
                  required
                  style={{ marginBottom: 4 }}
                />
                <textarea
                  name="description"
                  value={editFields.description || ''}
                  onChange={handleEditFieldChange}
                  style={{ marginBottom: 4 }}
                />
                <div style={{ marginBottom: 4, color: '#999', fontSize: '12px' }}>
                  User: {getUserName(task.userId)}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <label>
                    <input
                      type="checkbox"
                      name="completed"
                      checked={!!editFields.completed}
                      onChange={handleEditFieldChange}
                    />{' '}
                    Completed
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>Save</button>
                  <button className="btn" type="button" onClick={handleEditCancel} style={{ flex: 1 }}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div className="task-title" style={{ fontWeight: 'bold' }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
                    User: {getUserName(task.userId)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    className="btn"
                    style={{ padding: '5px 10px', fontSize: '12px', background: '#ffc107', color: '#333' }}
                    onClick={() => handleEditClick(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(task.id)}
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;

