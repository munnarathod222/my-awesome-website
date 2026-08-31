import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
        !isOnline ? 'bg-amber-600/95 text-white shadow-lg' : 'bg-emerald-600/95 text-white shadow-md'
      } px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-top))]`}
      role="alert"
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
          <span>You are currently offline. Changes will sync automatically when back online.</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Connection restored! Fleet & database synced.</span>
        </>
      )}
    </div>
  );
}
