import type { PermModule } from "../../model";

export const PER_PAGE = 7;
export const ROLES_VIEW_MODE_STORAGE_KEY = "interlink/admin_roles_view_mode";
export type RolesViewMode = "block" | "registry";

export function countTotalPerms(perms: PermModule[]): number {
  let count = 0;
  perms.forEach((mod) =>
    mod.perms.forEach((perm) => {
      perm.subperms?.forEach((sp) => {
        if (sp.value) count++;
      });
      perm.children?.forEach((ch) =>
        ch.subperms?.forEach((csp) => {
          if (csp.value) count++;
        }),
      );
    }),
  );
  return count;
}
