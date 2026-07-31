export interface DocSignerItem {
  id: string;
  name: string;
  position: string;
  role: "Подписывающий";
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  signed: boolean;
  signedAt: string;
}

export const GRADIENTS = [
  { from: "#f97316", to: "#ef4444" },
  { from: "#3b82f6", to: "#1d4ed8" },
  { from: "#10b981", to: "#059669" },
];

export const getInitials = (fullName: string) => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};
