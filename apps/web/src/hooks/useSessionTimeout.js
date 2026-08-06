import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes idle timeout
const WARNING_MS = 12 * 60 * 1000; // 12 minutes idle warning

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
        toast.error('Session expired due to 15 minutes of inactivity.');
        navigate('/login');
      }, TIMEOUT_MS);
    };

    const handleActivity = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      resetTimer();
      startTimers();
    };

    // Listen for mouse, keyboard, scroll, or touch activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    startTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isAuthenticated, logout, navigate, resetTimer]);

  return { showWarning, resetTimer };
};