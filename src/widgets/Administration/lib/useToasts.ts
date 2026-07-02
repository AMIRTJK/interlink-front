// Хук тостов раздела «Администрирование» (замена внутреннего механизма дизайна).
// Вынесен из ui/components.tsx, чтобы файл компонентов экспортировал только
// компоненты (правило react-refresh/only-export-components).
import * as React from "react";
import type { ToastItem } from "../model";

export function useToasts() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const addToast = React.useCallback((message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type: "success" }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      2500,
    );
  }, []);
  const removeToast = React.useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );
  return { toasts, addToast, removeToast };
}
