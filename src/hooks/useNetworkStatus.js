import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Browser is now ONLINE');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('📴 Browser is now OFFLINE');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Log initial status
    console.log('🔌 Initial browser status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus;
