// ─── Глобальная система тостов приложения ─────────────────────────────────────
// Визуальный стиль вынесен из src/widgets/Administration/ui/components.tsx и сделан
// общим инструментом системы. Здесь — внешнее хранилище + императивный API `toast.*`
// (drop-in замена для react-toastify). Отрисовку выполняет <ToastContainer/> из
// @shared/ui, который подписывается на это хранилище через useSyncExternalStore.

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  /** Через сколько мс закрыть автоматически; 0 — не закрывать. */
  duration: number;
}

type Listener = () => void;

let toasts: ToastData[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const emit = () => {
  for (const listener of listeners) listener();
};

// ── Подписка/снимок для useSyncExternalStore ──────────────────────────────────
export const subscribeToasts = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getToastsSnapshot = (): ToastData[] => toasts;

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3000,
  info: 3500,
  warning: 4000,
  error: 4500,
};

/** Убрать тост по id; без аргумента — очистить все. */
export const dismissToast = (id?: string) => {
  if (id == null) {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    if (toasts.length === 0) return;
    toasts = [];
    emit();
    return;
  }
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  const next = toasts.filter((t) => t.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
};

const push = (message: string, type: ToastType, duration?: number): string => {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const ms = duration ?? DEFAULT_DURATION[type];
  toasts = [...toasts, { id, message, type, duration: ms }];
  emit();
  if (ms > 0 && typeof window !== "undefined") {
    timers.set(
      id,
      setTimeout(() => dismissToast(id), ms),
    );
  }
  return id;
};

/** Подмножество опций react-toastify, которое мы поддерживаем. */
export interface ToastOptions {
  autoClose?: number | false;
}

const durationOf = (options?: ToastOptions): number | undefined => {
  if (!options || options.autoClose === undefined) return undefined;
  return options.autoClose === false ? 0 : options.autoClose;
};

function toastBase(message: string, options?: ToastOptions): string {
  return push(message, "info", durationOf(options));
}

// Императивный API. Совместим по вызову с react-toastify: toast.success/error/info/warn/…
export const toast = Object.assign(toastBase, {
  success: (message: string, options?: ToastOptions) => push(message, "success", durationOf(options)),
  error: (message: string, options?: ToastOptions) => push(message, "error", durationOf(options)),
  info: (message: string, options?: ToastOptions) => push(message, "info", durationOf(options)),
  warning: (message: string, options?: ToastOptions) => push(message, "warning", durationOf(options)),
  warn: (message: string, options?: ToastOptions) => push(message, "warning", durationOf(options)),
  dismiss: (id?: string) => dismissToast(id),
});
