import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { LoginForm } from './components/LoginForm';
import { Notification } from './components/Notification';
import { TicketDashboard } from './components/TicketDashboard';

const STORAGE_KEY = 'qa-tickets-user';

function readStoredUser() {
  const savedUser = window.localStorage.getItem(STORAGE_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(readStoredUser);
  const [notification, setNotification] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notification]);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const notify = useCallback((type, message, details = []) => {
    setNotification({ type, message, details });
  }, []);

  async function handleLogin(credentials) {
    setIsLoggingIn(true);

    try {
      const result = await api.login(credentials);
      setUser(result.user);
      notify('success', result.message);
      return result;
    } catch (error) {
      notify('error', error.message, error.details);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    setUser(null);
    notify('success', 'Sesion cerrada.');
  }

  return (
    <div className="app-shell">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      {user ? (
        <TicketDashboard user={user} onLogout={handleLogout} onNotify={notify} />
      ) : (
        <LoginForm onLogin={handleLogin} loading={isLoggingIn} />
      )}
    </div>
  );
}