export type UserGroup = "management" | "heads" | "specialists";

export interface IUser {
  id: number;
  name: string;
  role: string;
  avatar: string;
  group: UserGroup;
}

export interface IDepartment {
  id: number;
  name: string;
}

export interface IApiUser {
  id: number;
  full_name: string;
  position: string;
  photo_path: string | null;
}

export interface IApiDepartment {
  id: number;
  name: string;
}

// --- Helper: Определение группы по должности ---
export const getGroupByPosition = (position: string | null): UserGroup => {
  if (!position) return "specialists";
  const lower = position.toLowerCase();

  if (
    lower.includes("директор") ||
    lower.includes("admin") ||
    lower.includes("ceo") ||
    lower.includes("генеральный")
  ) {
    return "management";
  }

  if (
    lower.includes("руководитель") ||
    lower.includes("head") ||
    lower.includes("начальник") ||
    lower.includes("менеджер")
  ) {
    return "heads";
  }

  return "specialists";
};
