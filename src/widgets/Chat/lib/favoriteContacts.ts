import type { Contact } from "../model";

// Избранное беседы — серверный флаг `is_starred` (PATCH /conversations/{id}/settings),
// в карточке он приходит как `isStarred`. Бэкенд отдаёт беседы по свежести, а
// избранные должны стоять сверху: поднимаем их, не ломая порядок внутри групп.

/** Избранные беседы вперёд, порядок внутри избранных и остальных сохраняется. */
export const sortFavoritesFirst = (contacts: Contact[]): Contact[] => {
  if (!contacts.some((contact) => contact.isStarred)) return contacts;
  const { favorites, rest } = splitFavorites(contacts);
  return [...favorites, ...rest];
};

/** Разделяет беседы на избранные и остальные для отдельных секций списка. */
export const splitFavorites = (contacts: Contact[]) => {
  const favorites: Contact[] = [];
  const rest: Contact[] = [];
  contacts.forEach((contact) => {
    (contact.isStarred ? favorites : rest).push(contact);
  });
  return { favorites, rest };
};
