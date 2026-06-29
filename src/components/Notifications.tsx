import type { Notification } from '@/types';

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
}

const styleMap: Record<string, { bg: string; border: string }> = {
  success: { bg: 'bg-[#00d9a5]', border: 'border-[#00c495]' },
  warning: { bg: 'bg-yellow-500', border: 'border-yellow-600' },
  info: { bg: 'bg-[#0078d4]', border: 'border-[#006abc]' },
  error: { bg: 'bg-[#e94560]', border: 'border-[#d63b55]' },
};

export function Notifications({ notifications, onDismiss }: NotificationsProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 z-[10000] flex flex-col gap-2 max-w-sm">
      {notifications.map(n => {
        const s = styleMap[n.type] || styleMap.success;
        return (
          <div
            key={n.id}
            className={`${s.bg} border ${s.border} text-white px-4 py-3 rounded-lg shadow-xl animate-slide-in cursor-pointer text-[13px] font-medium flex items-center gap-2 hover:opacity-90 transition-opacity`}
            onClick={() => onDismiss(n.id)}
            role="alert"
          >
            <span className="flex-1">{n.message}</span>
            <button className="text-white/60 hover:text-white text-xs flex-shrink-0">✕</button>
          </div>
        );
      })}
    </div>
  );
}
