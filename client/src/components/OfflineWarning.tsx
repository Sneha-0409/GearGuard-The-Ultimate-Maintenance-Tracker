import React, { useEffect, useState, useRef } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { WifiOff, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';

const OfflineWarning: React.FC = () => {
  const isOnline = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (!isOnline) {
        setWasOffline(true);
      }
      return;
    }

    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      toast.success('Connection Restored', {
        icon: <Wifi className="w-5 h-5 text-green-500" />,
        duration: 4000,
      });
      setWasOffline(false);
    }
  }, [isOnline, wasOffline]);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2 px-4 shadow-md flex items-center justify-center space-x-2 animate-in slide-in-from-top-10">
      <WifiOff className="w-5 h-5 animate-pulse" />
      <span className="font-bold text-sm md:text-base">
        ⚠️ You are currently offline. Please reconnect to save changes.
      </span>
    </div>
  );
};

export default OfflineWarning;
