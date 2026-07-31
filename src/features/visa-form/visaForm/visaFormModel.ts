import { CorrespondenceResponse } from "@entities/correspondence";

export interface VisaFormProps {
  correspondenceData?: CorrespondenceResponse;
  className?: string; // Самый важный проп для встраивания
  onSuccess?: () => void; // Если нужно закрыть модалку после успеха
  onAssignExecutors?: () => void;
  selectedUserIds?: number[];
  selectedDeptIds?: number[];
  selectedMainExecutorIds?: number[];
  onClose: () => void;
}

export interface IApiUser {
  id: number;
  full_name: string;
  photo_path: string | null;
}

export interface IApiDepartment {
  id: number;
  name: string;
}

export const VISA_STATUS_OPTIONS = [
  { label: "Фаврӣ", value: "Фаврӣ" },
  { label: "Назоратӣ", value: "Назоратӣ" },
];
