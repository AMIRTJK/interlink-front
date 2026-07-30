import type { PermModule } from "../../model";

export const ACCESS_LEVEL_ITEMS: { label: string; perm: string }[] = [
  { label: "Личный кабинет — Просмотр", perm: "users.view" },
  { label: "Персонал — Просмотр", perm: "users.view" },
  { label: "Персонал — Редактирование", perm: "users.update" },
  { label: "Корреспонденция — Создание", perm: "correspondence.create" },
  { label: "Чат — Просмотр", perm: "tasks.view" },
  { label: "Управление пользователями", perm: "permissions.manage_ui" },
];

export function clonePerms(perms: PermModule[]): PermModule[] {
  return perms.map((m) => ({
    ...m,
    perms: m.perms.map((p) => ({
      ...p,
      subperms: p.subperms ? p.subperms.map((sp) => ({ ...sp })) : undefined,
      children: p.children
        ? p.children.map((ch) => ({
            ...ch,
            subperms: ch.subperms
              ? ch.subperms.map((csp) => ({ ...csp }))
              : undefined,
          }))
        : undefined,
    })),
  }));
}

export const EMPTY_PERMS: PermModule[] = [];
