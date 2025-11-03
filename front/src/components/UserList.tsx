import React, { useState } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface UserListProps {
  users: User[];
  selectedUserId: number | null;
  onUserSelect: (userId: number) => void;
  onShowAll: () => void;
  onUserCreated: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  selectedUserId,
  onUserSelect,
  onShowAll,
  onUserCreated,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', { email, name });
      setEmail('');
      setName('');
      setShowForm(false);
      onUserCreated();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Users</h2>
      <button
        className="btn btn-primary"
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '15px', width: '100%' }}
      >
        {showForm ? 'Cancel' : 'Add User'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '15px' }}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      )}

      <button
        className="btn"
        onClick={onShowAll}
        style={{
          width: '100%',
          marginBottom: '10px',
          backgroundColor: selectedUserId === null ? '#007bff' : '#f0f0f0',
          color: selectedUserId === null ? 'white' : '#333',
        }}
      >
        All Tasks
      </button>

      <div>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onUserSelect(user.id)}
            style={{
              padding: '10px',
              marginBottom: '5px',
              backgroundColor:
                selectedUserId === user.id ? '#e3f2fd' : '#f9f9f9',
              cursor: 'pointer',
              borderRadius: '4px',
              border:
                selectedUserId === user.id ? '2px solid #007bff' : '1px solid #ddd',
            }}
          >
            <strong>{user.name || user.email}</strong>
            <br />
            <small style={{ color: '#666' }}>{user.email}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;

