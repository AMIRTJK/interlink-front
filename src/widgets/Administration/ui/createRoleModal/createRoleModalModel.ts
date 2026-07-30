import type { PermModule } from "../../model";

export const CREATE_ROLE_COLORS: {
  id: string;
  label: string;
  bg: string;
  text: string;
}[] = [
  { id: "blue", label: "Синий", bg: "#EFF6FF", text: "#3B82F6" },
  { id: "green", label: "Зелёный", bg: "#ECFDF5", text: "#10B981" },
  { id: "amber", label: "Янтарный", bg: "#FFF7ED", text: "#F59E0B" },
  { id: "red", label: "Красный", bg: "#FEF2F2", text: "#EF4444" },
  { id: "purple", label: "Фиолетовый", bg: "#F5F3FF", text: "#8B5CF6" },
  { id: "pink", label: "Розовый", bg: "#FDF2F8", text: "#EC4899" },
  { id: "teal", label: "Бирюзовый", bg: "#F0FDFA", text: "#14B8A6" },
  { id: "slate", label: "Серый", bg: "#F1F5F9", text: "#64748B" },
];

export const DESC_MAX = 200;

export function moduleSlug(name: string, idx: number): string {
  return `crm-mod-${idx}-${name.length}`;
}

export function countModuleToggles(mod: PermModule): { active: number; total: number } {
  let active = 0;
  let total = 0;
  mod.perms.forEach((perm) => {
    if (perm.subperms)
      perm.subperms.forEach((sp) => {
        total += 1;
        if (sp.value) active += 1;
      });
    if (perm.children)
      perm.children.forEach((ch) => {
        if (ch.subperms)
          ch.subperms.forEach((csp) => {
            total += 1;
            if (csp.value) active += 1;
          });
      });
  });
  return { active, total };
}

export function isEcpLabel(label: string): boolean {
  return label.trim().startsWith("ЭЦП");
}
