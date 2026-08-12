export interface DocApproverItem {
  id: string;
  name: string;
  position: string;
  role: "Согласующий" | "Утверждающий" | "Ознакомлен";
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  signed: boolean;
  signedAt: string;
  /** Версия, на которой принято решение: «Версия 3.0» либо null. */
  versionLabel: string | null;
}

export const ROLE_BADGE: Record<
  DocApproverItem["role"],
  { bg: string; text: string; border: string }
> = {
  Согласующий: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Утверждающий: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  Ознакомлен: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

export const GRADIENTS = [
  { from: "#6366f1", to: "#8b5cf6" },
  { from: "#10b981", to: "#059669" },
  { from: "#ec4899", to: "#be185d" },
  { from: "#f59e0b", to: "#d97706" },
  { from: "#3b82f6", to: "#1d4ed8" },
];

export const getInitials = (fullName: string) => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};
