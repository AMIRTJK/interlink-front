import type { Contact, Message } from "../model";
import { ME } from "../model";

// Права на действия с сообщением. Это UX-гейт: итоговое решение всегда за
// бэкендом, здесь лишь не показываем кнопку, на которую заведомо прилетит 403.

/**
 * Кто может удалить сообщение у всех участников:
 * в личной беседе — любой участник, включая получателя;
 * в группе — автор сообщения, владелец и администратор.
 */
export const canDeleteForEveryone = (
  message: Message | null | undefined,
  contact: Contact | null | undefined,
): boolean => {
  if (!message) return false;
  if (message.deleted) return false;

  const isMine = message.senderId === ME;
  // Без загруженной беседы тип неизвестен — оставляем только безопасный случай.
  if (!contact) return isMine;
  if (!contact.isGroup) return true;

  return isMine || contact.myRole === "owner" || contact.myRole === "admin";
};
