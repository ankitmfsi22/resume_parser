import { useEffect } from 'react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface Props {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const AUTO_DISMISS_MS = 5000;

export default function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const style =
    toast.type === 'success'
      ? 'bg-green-600 text-white'
      : 'bg-red-600 text-white';

  return (
    <div className={`${style} rounded shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm`}>
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/70 hover:text-white leading-none"
      >
        &times;
      </button>
    </div>
  );
}