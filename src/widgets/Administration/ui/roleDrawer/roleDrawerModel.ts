import type { PermModule } from "../../model";

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
