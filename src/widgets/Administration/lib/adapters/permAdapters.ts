import type { PermModule, EcpRow, RoleCard } from "../../model";
import { getRoleColor } from "../../theme/tokens";
import {
  MODULE_TRANSLATIONS,
  ACTION_TRANSLATIONS,
  MODULE_ORDER,
} from "./translations";
import { formatJoinedDate, extractPermNames } from "./formatters";

/**
 * Строит матрицу модуль×действие в форме дизайна (PermModule[]).
 * allPermNames — полный каталог прав (FETCH_PERMISSIONS + права всех ролей),
 * activePermNames — права конкретной роли/пользователя (какие включены).
 * У каждого subperm сохраняется сырое имя `name` для сохранения в API.
 */
export function buildPermModules(
  allPermNames: string[],
  activePermNames: string[],
): PermModule[] {
  const active = new Set(activePermNames);
  const groups: Record<
    string,
    { label: string; name: string; value: boolean }[]
  > = {};

  allPermNames.forEach((permName) => {
    const dot = permName.indexOf(".");
    const moduleName = dot === -1 ? permName : permName.slice(0, dot);
    const actionName = dot === -1 ? "" : permName.slice(dot + 1);
    const label = ACTION_TRANSLATIONS[actionName] || actionName || permName;
    if (!groups[moduleName]) groups[moduleName] = [];
    // защита от дублей
    if (!groups[moduleName].some((a) => a.name === permName)) {
      groups[moduleName].push({
        label,
        name: permName,
        value: active.has(permName),
      });
    }
  });

  const moduleNames = Object.keys(groups).sort((a, b) => {
    const ia = MODULE_ORDER.indexOf(a);
    const ib = MODULE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return moduleNames.map((moduleName) => ({
    module: MODULE_TRANSLATIONS[moduleName] || moduleName,
    perms: [
      {
        label: "",
        value: groups[moduleName].some((a) => a.value),
        subperms: groups[moduleName].map((a) => ({
          label: a.label,
          value: a.value,
          name: a.name,
        })),
      },
    ],
  }));
}

/** Накладывает на матрицу прав union(role_permissions) + direct - denied */
export function applyEffectiveState(
  basePerms: PermModule[],
  unionRolePerms: Set<string>,
  direct: string[],
  denied: string[],
): PermModule[] {
  const directSet = new Set(direct);
  const deniedSet = new Set(denied);
  const applyToSubperms = (
    subperms?: { label: string; value: boolean; name?: string }[],
  ) =>
    subperms?.map((sp) => {
      if (!sp.name) return sp;
      let value = unionRolePerms.has(sp.name);
      if (directSet.has(sp.name)) value = true;
      if (deniedSet.has(sp.name)) value = false;
      return { ...sp, value };
    });
  return basePerms.map((m) => ({
    ...m,
    perms: m.perms.map((p) => ({
      ...p,
      subperms: applyToSubperms(p.subperms) ?? p.subperms,
      children: p.children?.map((ch) => ({
        ...ch,
        subperms: applyToSubperms(ch.subperms) ?? ch.subperms,
      })),
    })),
  }));
}

/** Собирает включённые сырые имена прав обратно из матрицы (для сохранения) */
export function collectEnabledPermNames(perms: PermModule[]): string[] {
  const names: string[] = [];
  perms.forEach((mod) =>
    mod.perms.forEach((p) => {
      p.subperms?.forEach((sp) => {
        if (sp.value && sp.name) names.push(sp.name);
      });
      p.children?.forEach((ch) =>
        ch.subperms?.forEach((csp) => {
          if (csp.value && csp.name) names.push(csp.name);
        }),
      );
    }),
  );
  return names;
}

/**
 * ЭЦП-права роли. MOCK/приближение: выводим из наличия соответствующих прав,
 * т.к. отдельного контракта под «Право подписи/Визирование/Согласование» нет.
 */
export function deriveEcp(activePermNames: string[]): EcpRow[] {
  const has = (frag: string) => activePermNames.some((p) => p.includes(frag));
  return [
    { label: "Право подписи", value: has("signatures.sign") || has("sign") },
    { label: "Визирование", value: has("approvals") || has("approve") },
    { label: "Согласование", value: has("approvals") || has("approve") },
  ];
}

export function adaptRoleCard(
  role: {
    id: number;
    name: string;
    description?: string;
    permissions?: unknown;
    created_at?: string;
  },
  opts: { allPermNames: string[]; userCount: number },
): RoleCard {
  const permissionNames = extractPermNames(role.permissions);
  const color = getRoleColor(role.name);
  return {
    id: String(role.id),
    name: role.name,
    description: role.description || "Без описания",
    userCount: opts.userCount,
    badges: [], // MOCK: нет полей бейджей у роли
    color: color.bg,
    textColor: color.text,
    perms: buildPermModules(opts.allPermNames, permissionNames),
    permissionNames,
    createdAt: formatJoinedDate(role.created_at),
  };
}
