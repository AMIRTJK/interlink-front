import type { IHrOrder, IHrOrderAttachment, IHrOrderEmployee } from "@entities/hr";

export type TOrderStatus = "draft" | "pending" | "signed" | "approved";

export interface IOrderRecord {
  id: number;
  organizationId: number;
  employeeId: number;
  executorId: number;
  type: string;
  number: string;
  date: string;
  orderDate: string;
  basis: string;
  points: string[];
  ministerName: string;
  ministerSigned: boolean;
  executorSigned: boolean;
  status: TOrderStatus;
  employeeName: string;
  employeePosition: string;
  executorName: string;
  executorPosition: string;
  attachments: IHrOrderAttachment[];
  raw: IHrOrder;
}

const STATUS_MAP: Record<string, TOrderStatus> = {
  draft: "draft",
  pending: "pending",
  signed: "signed",
  approved: "approved",
};

const buildName = (e?: IHrOrderEmployee) =>
  e?.full_name || "—";

export const normalizeOrder = (o: IHrOrder): IOrderRecord => ({
  id: o.id,
  organizationId: o.organization_id,
  employeeId: o.employee_id,
  executorId: o.executor_id,
  type: o.type,
  number: o.number,
  date: o.date,
  orderDate: o.order_date,
  basis: o.basis || "",
  points: o.points || [],
  ministerName: o.minister_name,
  ministerSigned: o.minister_signed,
  executorSigned: o.executor_signed,
  status: STATUS_MAP[o.status] || (o.status as TOrderStatus),
  employeeName: buildName(o.employee),
  employeePosition: o.employee?.position || "—",
  executorName: buildName(o.executor),
  executorPosition: o.executor?.position || "—",
  attachments: o.attachments || [],
  raw: o,
});

export const normalizeOrders = (raw: IHrOrder[]): IOrderRecord[] =>
  (Array.isArray(raw) ? raw : []).map(normalizeOrder);

export const ORDER_TYPES = [
  "Приказ по основной деятельности",
  "Приказ по личному составу",
  "Дисциплинарный приказ",
  "Приказ об отпуске",
  "Приказ о приёме на работу",
  "Приказ об увольнении",
  "Приказ о командировке",
  "Приказ о поощрении",
  "Приказ о реструктуризации",
] as const;

export const ORDER_STATUS_LABELS: Record<TOrderStatus, string> = {
  draft: "Черновик",
  pending: "На подписании",
  signed: "Подписан",
  approved: "Утверждён",
};
