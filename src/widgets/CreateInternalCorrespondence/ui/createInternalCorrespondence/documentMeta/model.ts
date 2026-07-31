import type { ImportanceLevel } from "../../../types";

export interface ILetterTypeOption {
  value: string;
  label: string;
  desc: string;
}

export interface IImportanceOption {
  value: ImportanceLevel;
  label: string;
  desc: string;
  flagFill: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}
