import type { Approver, FinalSigner, RecipientOption } from "../../types";

// Инициалы как их показывает интерфейс: первые буквы первых двух слов ФИО.
export const initialsOf = (fullName: string): string =>
  fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

export const recipientFromUser = (user: any): RecipientOption => ({
  id: String(user.id),
  name: user.full_name,
  org: user.position || user.department || "Сотрудник",
  initials: initialsOf(user.full_name),
  color: "bg-blue-100 text-blue-700",
});

// Отправитель исходного письма при «Ответить». ФИО здесь приходит из navigate
// state и может содержать двойные пробелы, поэтому режем по любому пробелу.
export const recipientFromComposeCreator = (creator: {
  id?: string | number;
  full_name?: string;
  position?: string;
  department?: string;
}): RecipientOption => ({
  id: String(creator.id),
  name: creator.full_name || "",
  org: creator.position || creator.department || "Сотрудник",
  initials: (creator.full_name || "")
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase(),
  color: "bg-blue-100 text-blue-700",
});

// Согласующий из записи согласования сохранённого письма.
export const approverFromApproval = (a: any): Approver => {
  const userData = a.approver || a.user;

  return {
    id: String(userData?.id),
    approvalRecordId: String(a.id),
    isInvited: true,
    name: userData?.full_name || "Неизвестно",
    role: userData?.position || "Сотрудник",
    initials: userData?.full_name ? initialsOf(userData.full_name) : "",
    color: "bg-slate-100 text-slate-700",
    approved: a.status === "approved",
    approving: false,
    comment: a.note || "",
    showCommentInput: false,
    dsApplied: a.status === "approved",
    dsLoading: false,
    status: a.status,
    note: a.note || null,
    decided_at: a.decided_at || null,
  };
};

// Согласующий из маршрута согласования (workflow) — комментарий там не приходит.
export const approverFromWorkflow = (wfA: any, user: any): Approver => ({
  id: String(user.id),
  approvalRecordId: String(wfA.id),
  isInvited: true,
  name: user.full_name,
  role: user.position || "Сотрудник",
  initials: initialsOf(user.full_name),
  color: "bg-slate-100 text-slate-700",
  approved: wfA.status === "approved",
  approving: false,
  comment: "",
  showCommentInput: false,
  dsApplied: wfA.status === "approved",
  dsLoading: false,
});

// Актуальная подпись: последняя неотозванная, а если отозваны все — последняя.
export const pickActiveSignature = (signatures: any[]) => {
  const activeSigs = signatures.filter((s: any) => s.status !== "revoked");
  return activeSigs.length > 0
    ? activeSigs[activeSigs.length - 1]
    : signatures[signatures.length - 1];
};

export const finalSignerFromSignature = (s: any): FinalSigner => ({
  id: String(s.user.id),
  isInvited: true,
  name: s.user.full_name,
  role: s.user.position || "Сотрудник",
  initials: initialsOf(s.user.full_name),
  color: "bg-purple-100 text-purple-700",
  dsApplied: s.status === "signed",
  dsDeclined: s.status === "declined",
  declineReason: s.decline_reason || s.reason,
  dsLoading: false,
});

// Подписывающего ещё не приглашали — по умолчанию им считается автор документа.
export const finalSignerFromCreator = (creator: any): FinalSigner => ({
  id: String(creator.id),
  isInvited: false,
  name: creator.full_name,
  role: creator.position || "Автор документа",
  initials: initialsOf(creator.full_name),
  color: "bg-purple-100 text-purple-700",
  dsApplied: false,
  dsLoading: false,
});
