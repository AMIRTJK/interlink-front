export interface ISearchItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  tag?: string;
  previewUrl?: string;
  reg_number?: string;
}

export interface ISmartSearchModalProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  placeholder?: string;

  items?: ISearchItem[];
  querySettings?: {
    url: string;
    params?: Record<string, any>;
    queryKey?: any[];
  };
  transformResponse?: (data: any) => ISearchItem[];
  mode?: "attach" | "select";
  onSelect?: (item: ISearchItem) => void;
  onConfirm: (selectedIds: string[], items: ISearchItem[]) => void;
  multiple?: boolean;
}

export interface ISelectionState {
  selectedIds: string[];
  activePreviewItem: ISearchItem | null;
}
