import { InternalCorrespondenceStatus } from "@entities/correspondence";

interface ITabItem {
  id: string;
  label: string;
}

export const INTERNAL_OUTGOING_TABS: ITabItem[] = [
  { id: InternalCorrespondenceStatus.TO_APPROVE, label: "На согласовании" },
  { id: InternalCorrespondenceStatus.TO_SIGN, label: "На подпись" },
];
