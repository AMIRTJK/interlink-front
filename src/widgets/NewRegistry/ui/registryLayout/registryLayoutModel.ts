import type { IBreadcrumbItem } from "@shared/ui";

export type ViewMode = "list" | "block" | "structure";

export interface RegistryLayoutProps {
  documents: any[];
  meta: any;
  tabs: any[];
  activeTabId: string;
  createButtonText?: string;
  onTabChange: (id: string) => void;
  onPageChange: (page: number) => void;
  onFilterApply: (filters: any) => void;
  onFilterReset: () => void;
  onCardClick: (id: number) => void;
  onVersionClick?: (docId: number, versionId?: number, versionNum?: string) => void;
  onCreate: () => void;
  currentFilters: any;
  statusConfig: any;
  fieldConfig: any; // Наш конфиг полей и действий
  breadcrumbs?: IBreadcrumbItem[]; // Крошки для навигации
}
