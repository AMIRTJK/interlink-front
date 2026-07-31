import { PreviewApprover, GRADIENTS } from "./incomingPreviewModalModel";

export const getInitials = (fullName: string): string => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export const getShortName = (fullName: string): string => {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[1][0]}. ${parts[0]}`;
  }
  return fullName;
};

export const getCertSnippet = (initials: string): string => {
  const hex = initials
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).toUpperCase())
    .join("");
  return `SN: ${hex}A3F9...C12D`;
};

export const buildPreviewApproversList = (
  signatures: any[] = [],
  approvals: any[] = []
): PreviewApprover[] => {
  const list: PreviewApprover[] = [];

  (signatures || []).forEach((sig: any, idx: number) => {
    const user = sig.user || sig.approver || {};
    const name = user.full_name || "Неизвестно";
    const initials = getInitials(name);
    const isSigned = sig.status === "signed";
    let signedDateStr = "";
    if (isSigned) {
      const dateVal = sig.signed_at || sig.updated_at;
      if (dateVal) {
        const d = new Date(dateVal);
        const pad = (n: number) => String(n).padStart(2, "0");
        signedDateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }

    list.push({
      name,
      shortName: getShortName(name),
      initials,
      gradient: GRADIENTS[idx % GRADIENTS.length],
      role: "Подписывающий",
      signed: isSigned,
      date: signedDateStr,
      cert: getCertSnippet(initials),
    });
  });

  (approvals || []).forEach((app: any, idx: number) => {
    const user = app.approver || app.user || {};
    const name = user.full_name || "Неизвестно";
    const initials = getInitials(name);
    const isSigned = app.status === "approved";
    let signedDateStr = "";
    if (isSigned) {
      const dateVal = app.signed_at || app.updated_at;
      if (dateVal) {
        const d = new Date(dateVal);
        const pad = (n: number) => String(n).padStart(2, "0");
        signedDateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }

    list.push({
      name,
      shortName: getShortName(name),
      initials,
      gradient: GRADIENTS[(idx + (signatures?.length || 0)) % GRADIENTS.length],
      role: "Согласующий",
      signed: isSigned,
      date: signedDateStr,
      cert: getCertSnippet(initials),
    });
  });

  return list;
};
