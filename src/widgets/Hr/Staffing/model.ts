// Вид отображения структуры
export type TStaffingView = "list" | "grid" | "tree" | "chart";

// Организация в штатном расписании (заготовка, расширим под API)
export interface IStaffOrganization {
  id: number;
  name: string;
  departmentsCount?: number;
  positionsCount?: number;
}
