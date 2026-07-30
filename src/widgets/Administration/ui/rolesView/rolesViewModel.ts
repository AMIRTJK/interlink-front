import type { PermModule } from "../../model";

export const PER_PAGE = 10;

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
