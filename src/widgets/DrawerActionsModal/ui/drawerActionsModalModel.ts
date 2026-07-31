import { ISmartSearchModalProps } from "@shared/ui/SmartSearchModal";

export type TModalType = "attach" | "signer" | "approvers";

export const VISIBLE_ITEMS_LIMIT = 3;

export type TModalConfig = Omit<ISmartSearchModalProps, "onConfirm"> & {
  mode: "attach" | "select";
};
