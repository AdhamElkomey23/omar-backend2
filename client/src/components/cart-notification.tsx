import { useState, useEffect } from 'react';

interface CartNotificationProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export function CartNotification({ 
  visible, 
  message, 
  onClose 
}: CartNotificationProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 bg-accent text-white py-2 px-4 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-top duration-300">
      <p className="font-medium">{message}</p>
    </div>
  );
}
