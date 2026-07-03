// Тосты раздела «Администрирование» теперь используют общий инструмент
// (@shared/lib/toast), который отображается глобальным <ToastContainer/> из @shared/ui.
// Хук оставлен тонким адаптером, чтобы не менять проброс `addToast` по всему дереву
// компонентов раздела. Локальный список тостов больше не нужен (пустой).
import * as React from "react";
import { toast } from "@shared/lib/toast";
import type { ToastItem } from "../model";

const EMPTY_TOASTS: ToastItem[] = [];

export function useToasts() {
  const addToast = React.useCallback((message: string) => {
    toast.success(message);
  }, []);
  const removeToast = React.useCallback(() => {}, []);
  return { toasts: EMPTY_TOASTS, addToast, removeToast };
}
