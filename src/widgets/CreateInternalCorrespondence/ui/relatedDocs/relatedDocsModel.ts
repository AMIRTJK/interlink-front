import type {
  IRelatedDocumentLink,
  IRelatedDocItem,
  IRelatedDocCreator,
} from "@widgets/NewRegistry/lib/structure/types";

export interface IChainDocItem {
  id: number;
  kind: "incoming" | "outgoing";
  typeLabel: string;
  dateLabel?: string;
  regNumber?: string;
  subject?: string;
  isCurrent?: boolean;
  rawDateObj?: Date;
  creator?: IRelatedDocCreator | null;
}

export function formatDateStr(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return undefined;
    return d.toLocaleDateString("ru-RU");
  } catch {
    return undefined;
  }
}

export const getInitials = (name?: string): string => {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

export function buildRelatedChain(
  relatedDocuments?: IRelatedDocumentLink[],
  currentDoc?: {
    id?: number | string;
    kind?: "incoming" | "outgoing" | string;
    date?: string;
    reg_number?: string;
    subject?: string;
    creator?: IRelatedDocCreator | null;
  },
): IChainDocItem[] {
  const map = new Map<string, IChainDocItem>();
  const currentIdNum =
    currentDoc?.id != null ? Number(currentDoc.id) : undefined;
  const currentKind = currentDoc?.kind === "incoming" ? "incoming" : "outgoing";

  const addDoc = (
    doc?: IRelatedDocItem | any,
    fallbackKind?: "incoming" | "outgoing",
    forceCurrent?: boolean,
  ) => {
    if (!doc || doc.id == null) return;
    const id = Number(doc.id);
    const kind =
      (doc.kind as "incoming" | "outgoing") || fallbackKind || "incoming";
    const key = `${kind}-${id}`;
    if (map.has(key)) return;

    const isCurrent =
      forceCurrent ||
      (currentIdNum != null && id === currentIdNum && kind === currentKind);

    const rawDate = doc.doc_date || doc.sent_at || doc.created_at || doc.date;
    const formattedDate =
      formatDateStr(rawDate) ||
      (typeof doc.date === "string" && doc.date.includes(".")
        ? doc.date
        : undefined);
    const rawDateObj = rawDate ? new Date(rawDate) : undefined;

    map.set(key, {
      id,
      kind,
      typeLabel: kind === "incoming" ? "Входящее письмо" : "Исходящее письмо",
      dateLabel: formattedDate ? `от ${formattedDate}` : "",
      regNumber: doc.reg_number || doc.inboundNumber,
      subject: doc.subject,
      isCurrent: Boolean(isCurrent),
      rawDateObj,
      creator: doc.creator || null,
    });
  };

  if (relatedDocuments && relatedDocuments.length > 0) {
    relatedDocuments.forEach((rel) => {
      if (rel.incoming) addDoc(rel.incoming, "incoming");
      if (rel.outgoing) addDoc(rel.outgoing, "outgoing");
    });
  }

  if (currentDoc && currentDoc.id != null) {
    const key = `${currentKind}-${currentIdNum}`;
    if (!map.has(key)) {
      addDoc(currentDoc, currentKind, true);
    } else {
      const existing = map.get(key)!;
      existing.isCurrent = true;
      if (!existing.creator && currentDoc.creator) {
        existing.creator = currentDoc.creator;
      }
    }
  }

  const list = Array.from(map.values());
  list.sort((a, b) => {
    if (a.rawDateObj && b.rawDateObj) {
      const diff = a.rawDateObj.getTime() - b.rawDateObj.getTime();
      if (diff !== 0) return diff;
    }
    if (a.id !== b.id) return a.id - b.id;
    return a.kind === "incoming" ? -1 : 1;
  });

  return list;
}

