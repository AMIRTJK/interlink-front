import {
  IApprovalVersionSummary,
  resolveApprovalVersionId,
  resolveApprovalVersionLabel,
} from "@entities/correspondence";
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
export const approverFromApproval = (
  a: any,
  summary?: IApprovalVersionSummary | null,
): Approver => {
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
    versionId: resolveApprovalVersionId(a, summary),
    versionLabel: resolveApprovalVersionLabel(a, summary),
  };
};

// Согласующий из маршрута согласования (workflow) — комментарий там не приходит.
export const approverFromWorkflow = (
  wfA: any,
  user: any,
  summary?: IApprovalVersionSummary | null,
): Approver => ({
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
  versionId: resolveApprovalVersionId(wfA, summary),
  versionLabel: resolveApprovalVersionLabel(wfA, summary),
});

// Актуальная подпись: подписанная, а если нет — последняя неотозванная (или последняя).
export const pickActiveSignature = (signatures: any[]) => {
  if (!Array.isArray(signatures) || signatures.length === 0) return null;
  const signedSigs = signatures.filter((s: any) => s.status === "signed");
  if (signedSigs.length > 0) {
    return signedSigs[signedSigs.length - 1];
  }
  const activeSigs = signatures.filter((s: any) => s.status !== "revoked");
  return activeSigs.length > 0
    ? activeSigs[activeSigs.length - 1]
    : signatures[signatures.length - 1];
};

// Нормализация подписей: для каждого подписанта оставляем только 1 актуальную запись (подписанную > ожидающую).
export const normalizeSignatures = (signatures: any[]): any[] => {
  if (!Array.isArray(signatures) || signatures.length === 0) return [];
  const userGroups = new Map<string | number, any[]>();
  signatures.forEach((sig: any) => {
    const userId = sig.user?.id || sig.user_id || sig.approver?.id || "default";
    const existing = userGroups.get(userId) || [];
    existing.push(sig);
    userGroups.set(userId, existing);
  });

  const result: any[] = [];
  userGroups.forEach((userSigs) => {
    const active = pickActiveSignature(userSigs);
    if (active) result.push(active);
  });

  return result;
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
