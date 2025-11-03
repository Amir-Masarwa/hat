import React, { useState, useEffect } from 'react';
import './App.css';
import { api, setApiToken } from './services/api';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import VerificationPage from './components/VerificationPage';

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

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [verificationName, setVerificationName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setApiToken(token);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
      fetchTasks();
    }
  }, [isAuthenticated]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      setCurrentUser(response.data);
    } catch (error) {
      setCurrentUser(null);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
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

  const logout = () => {
    localStorage.removeItem('token');
    setApiToken(null);
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
            // Clear verification state and show login page
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
          onLogin={(token: string) => {
            localStorage.setItem('token', token);
            setApiToken(token);
            setIsAuthenticated(true);
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
          onLogin={(token: string) => {
            localStorage.setItem('token', token);
            setApiToken(token);
            setIsAuthenticated(true);
          }}
          onSwitchToSignUp={() => setShowSignUp(true)}
        />
      );
    }
  }

  if (loading) {
    return <div className="App"><p>Loading...</p></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Manager</h1>
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <span style={{ marginRight: 16 }}>{currentUser?.email}</span>
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </header>
      <div className="container">
        <div className="main-content">
          <div className="content">
            <TaskList
              tasks={tasks}
              users={[currentUser].filter(Boolean) as User[]}
              selectedUserId={currentUser?.id || null}
              onTaskUpdate={handleTaskUpdated}
              onTaskDelete={handleTaskDeleted}
            />
            <TaskForm
              users={[currentUser].filter(Boolean) as User[]}
              selectedUserId={currentUser?.id || null}
              onTaskCreated={handleTaskCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

