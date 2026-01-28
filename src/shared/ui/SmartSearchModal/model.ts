// import { ReactNode } from 'react';
export interface ISearchItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  tag?: string;
  previewUrl?: string;
}

export interface ISmartSearchModalProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  placeholder?: string;
  
  // Data Source
  items?: ISearchItem[];
  querySettings?: {
    url: string;
    params?: Record<string, any>;
    queryKey?: any[]; 
  };
  transformResponse?: (data: any) => ISearchItem[];
  
  // Behavior
  mode?: 'attach' | 'select'; // attach = list -> split, select = list only
  onSelect?: (item: ISearchItem) => void;
  onConfirm: (selectedIds: string[], items: ISearchItem[]) => void; // Pass full items back
  multiple?: boolean;
}

export interface ISelectionState {
  selectedIds: string[];
  activePreviewItem: ISearchItem | null;
}