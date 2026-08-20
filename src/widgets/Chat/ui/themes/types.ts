import type { TChatVariant } from "../../model";
import type { TChatAppState } from "../../lib/useChatAppState";

/**
 * Контракт оболочки оформления. Данные, состояние и обработчики приходят
 * готовыми — оболочка отвечает только за раскладку и вид, поэтому новое
 * оформление добавляется одним компонентом с этими пропсами.
 */
export interface IChatShellProps {
  state: TChatAppState;
  variant: TChatVariant;
  /** Развёрнут ли всплывающий чат на весь экран (только для variant="overlay"). */
  isExpanded: boolean;
  /** Переключение «компактное окно ↔ весь экран». Кнопки нет, если не передан. */
  onToggleExpand?: () => void;
  onRequestClose?: () => void;
}
