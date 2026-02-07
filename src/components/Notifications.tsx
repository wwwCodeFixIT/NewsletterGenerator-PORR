import type { Notification } from '@/types';

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
}

const typeClasses: Record<string, string> = {
  success: 'notif-success',
  warning: 'notif-warning',
  info: 'notif-info',
  error: 'notif-error',
};

const typeIcons: Record<string, string> = {
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
  error: '❌',
};

export function Notifications({ notifications, onDismiss }: NotificationsProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-4 sm:bottom-4 z-[10000] flex flex-col gap-1.5 sm:max-w-[340px]">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`animate-slide-in cursor-pointer rounded-xl px-3 py-2 text-[11px] font-semibold text-white shadow-xl flex items-center gap-2 hover:opacity-90 transition-opacity ${typeClasses[n.type] || 'notif-success'}`}
          onClick={() => onDismiss(n.id)}
        >
          <span className="text-sm shrink-0">{typeIcons[n.type] || '✅'}</span>
          <span className="flex-1 min-w-0 text-ellipsis overflow-hidden">{n.message}</span>
          <button className="shrink-0 text-white/50 hover:text-white text-lg leading-none ml-0.5">&times;</button>
        </div>
      ))}
    </div>
  );
}
