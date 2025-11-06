import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './services/api';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import VerificationPage from './components/VerificationPage';
import AdminPanel from './components/AdminPanel';

interface User {
  id: number;
  email: string;
  name?: string;
  isAdmin?: boolean;
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

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [verificationName, setVerificationName] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
      setIsAuthenticated(true);
      fetchTasks();
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setCurrentUser(response.data);
    } catch (error) {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      setTasks([]);
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    fetchTasks();
  };

  const handleTaskDeleted = () => {
    fetchTasks();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setCurrentUser(null);
    setTasks([]);
    setIsAuthenticated(false);
    setShowSignUp(false);
    setVerificationEmail(null);
    setVerificationName(null);
  };

  const handleResendCode = async () => {
    if (!verificationEmail) return;
    try {
      await api.post('/auth/resend', {
        email: verificationEmail,
      });
    } catch (err) {
      throw err;
    }
  };

  if (!isAuthenticated) {
    if (verificationEmail) {
      return (
        <VerificationPage
          email={verificationEmail}
          onVerified={() => {
            setVerificationEmail(null);
            setVerificationName(null);
            setShowSignUp(false);
          }}
          onResend={handleResendCode}
        />
      );
    } else if (showSignUp) {
      return (
        <SignUpPage
          onLogin={() => {
            checkSession();
          }}
          onSwitchToLogin={() => setShowSignUp(false)}
          onVerificationSent={(email: string, name: string) => {
            setVerificationEmail(email);
            setVerificationName(name);
          }}
        />
      );
    } else {
      return (
        <LoginPage
          onLogin={() => {
            checkSession();
          }}
          onSwitchToSignUp={() => setShowSignUp(true)}
        />
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">✓</span>
              Task Manager
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-blue-100 text-sm">{currentUser?.name || currentUser?.email}</span>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Layout: Tasks on Left, Create Form on Right, Admin Panel at Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Task List */}
          <div className="space-y-6">
            <TaskList
              tasks={tasks}
              users={[currentUser].filter(Boolean) as User[]}
              selectedUserId={currentUser?.id || null}
              onTaskUpdate={handleTaskUpdated}
              onTaskDelete={handleTaskDeleted}
            />
          </div>
          
          {/* Right Side: Create Task Form */}
          <div className="space-y-6">
            <TaskForm
              users={[currentUser].filter(Boolean) as User[]}
              selectedUserId={currentUser?.id || null}
              onTaskCreated={handleTaskCreated}
            />
          </div>
        </div>
        
        {/* Admin Panel: Full Width at Bottom (if admin) */}
        {currentUser?.isAdmin && (
          <div className="mt-6">
            <AdminPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

