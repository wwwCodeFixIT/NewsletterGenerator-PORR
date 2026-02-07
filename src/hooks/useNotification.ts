import { useState, useCallback, useRef } from 'react';
import type { Notification, NotificationType } from '@/types';

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, type: NotificationType = 'success') => {
    const id = nextId.current++;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, show, dismiss };
}
