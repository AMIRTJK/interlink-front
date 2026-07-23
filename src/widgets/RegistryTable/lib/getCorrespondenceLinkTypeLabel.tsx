export type CorrespondenceLinkType = "reply" | "forward" | null | undefined;

const LETTER_TYPE_MAP: Record<string, string> = {
  guzorish: "Гузориш",
  ariza: "Ариза",
  darkhost: "Дархост",
  malumotnoma: "Маълумотнома",
  maktub: "Мактуб",
  Гузориш: "Гузориш",
  Ариза: "Ариза",
  Дархост: "Дархост",
  Маълумотнома: "Маълумотнома",
  Мактуб: "Мактуб",
};

export const getLetterTypeName = (d: any): string => {
  if (!d) return "Мактуб";

  if (typeof d.letter_type === "object" && d.letter_type) {
    if (d.letter_type.label) return d.letter_type.label;
    if (d.letter_type.name) return d.letter_type.name;
    if (d.letter_type.title) return d.letter_type.title;
  }
  if (typeof d.document_type === "object" && d.document_type) {
    if (d.document_type.label) return d.document_type.label;
    if (d.document_type.name) return d.document_type.name;
    if (d.document_type.title) return d.document_type.title;
  }

  const rawType =
    d.letter_type ||
    d.letter_type_name ||
    d.letter_type_label ||
    d.document_type ||
    d.document_type_name ||
    d.document_type_label ||
    d.type;

  if (typeof rawType === "string" && rawType.trim()) {
    const key = rawType.trim().toLowerCase();
    if (LETTER_TYPE_MAP[key]) return LETTER_TYPE_MAP[key];
    if (LETTER_TYPE_MAP[rawType.trim()]) return LETTER_TYPE_MAP[rawType.trim()];
    return rawType.trim();
  }

  return "Мактуб";
};

export const getCorrespondenceLinkTypeLabel = (
  linkType: CorrespondenceLinkType,
  relationLabel?: string | null,
  record?: any,
): { label: string; color: string } | null => {
  const label = getLetterTypeName(record || { link_type: linkType, relation_label: relationLabel });
  return { label, color: "#7B46C0" };
};
