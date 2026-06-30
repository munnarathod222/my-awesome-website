import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 25 * 60 * 1000; // 25 minutes

export const useSessionTimeout = (isAuthenticated, logout) => {
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  const resetTimer = useCallback(() => {
    if (showWarning) setShowWarning(false);
  }, [showWarning]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let warningTimer;
    let logoutTimer;

    const startTimers = () => {
      warningTimer = setTimeout(() => {
        setShowWarning(true);
      }, WARNING_MS);

      logoutTimer = setTimeout(() => {
        logout();
        toast.error('Session expired due to inactivity.');
        navigate('/login');
      }, TIMEOUT_MS);
    };

    const handleActivity = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      resetTimer();
      startTimers();
    };

    // Listen for activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    startTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [isAuthenticated, logout, navigate, resetTimer]);

  return { showWarning, resetTimer };
};