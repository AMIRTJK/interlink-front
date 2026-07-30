import type { ExtUser } from "../../model";

export type AddUserEmployeeTab = "existing" | "new";

export type SelectedEmployee =
  | { source: "existing"; user: ExtUser }
  | { source: "new"; fio: string };

export interface UserFormData {
  fio: string;
  dob: string;
  gender: string;
  inn: string;
  phone: string;
  email: string;
  address: string;
  department: string;
  position: string;
  role: string;
  joinedDate: string;
  supervisor: string;
  status: string;
  corpEmail: string;
}

export function emptyFormData(defaultRole: string): UserFormData {
  return {
    fio: "",
    dob: "",
    gender: "Мужской",
    inn: "",
    phone: "",
    email: "",
    address: "",
    department: "",
    position: "",
    role: defaultRole,
    joinedDate: "",
    supervisor: "",
    status: "Активен",
    corpEmail: "",
  };
}

export function buildFormDataFromExtUser(
  u: ExtUser,
  defaultRole: string,
): UserFormData {
  return {
    ...emptyFormData(defaultRole),
    fio: u.fio,
    email: u.email === "—" ? "" : u.email,
    department: u.department === "—" ? "" : u.department,
    position: u.position === "—" ? "" : u.position,
    role: u.roles[0] ?? defaultRole,
    joinedDate: u.joinedDate === "—" ? "" : u.joinedDate,
    status: u.status === "Заблокирован" ? "Неактивен" : u.status,
    corpEmail: u.email === "—" ? "" : u.email,
  };
}
