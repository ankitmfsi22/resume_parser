import { useCallback, useState } from 'react';
import type { ToastMessage } from '../components/Toast';

let nextId = 0;
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    setToasts((current) => [...current, { id: nextId++, message, type }]);
  }, []);

  return { toasts, show, dismiss };
}
