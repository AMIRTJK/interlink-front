export type LetterDirection = "incoming" | "outgoing";

export interface IStructureDocument {
  id: number;
  role: string;
  channel: string;
  kind: string;
  status: string;
  subject: string;
  reg_number: string | null;
  tracking_number: string | null;
  created_at: string;
  sent_at: string | null;
  creator: {
    id: number;
    first_name?: string;
    last_name?: string;
    middle_name?: string | null;
    full_name: string;
    phone?: string;
  } | null;
}

export interface IStructureLifecycle {
  status: string;
  created_at: string;
  sent_at: string | null;
  current_version_id: number | null;
  selected_version_id: number | null;
}

export interface ITimelineActor {
  id: number;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  full_name: string;
  phone?: string;
}

export interface ITimelineEvent {
  type: string;
  action: string;
  performed_at: string;
  actor: ITimelineActor | null;
  document_id: number;
  version_id?: number;
  approval_id?: number;
  signature_id?: number;
  resolution_id?: number;
  assignment_id?: number;
  data?: Record<string, any>;
}

export interface IRelatedDocCreator {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  full_name?: string;
  phone?: string;
  position?: string | null;
  photo_path?: string | null;
  photo_url?: string | null;
}

export interface IRelatedDocItem {
  id: number;
  role?: string;
  channel?: string;
  kind?: string;
  status?: string;
  subject?: string;
  reg_number?: string;
  tracking_number?: string | null;
  created_at?: string;
  sent_at?: string | null;
  doc_date?: string;
  date?: string;
  creator?: IRelatedDocCreator | null;
}

export interface IRelatedDocumentLink {
  type?: string;
  link_type?: string;
  link_label?: string;
  incoming?: IRelatedDocItem;
  outgoing?: IRelatedDocItem;
}

// Количество этапов структуры письма. Реестры внутренней корреспонденции
// (inbox/sent/drafts/trash/to-approve/to-sign/processed) отдают его в каждом
// письме как structure_count — оно равно длине timeline из /structure,
// поэтому для показа счётчика отдельный запрос не нужен.
export interface IStructureCountable {
  structure_count?: number;
  events_count?: number;
  timeline_count?: number;
  history_count?: number;
}

export interface IInternalStructureResponse {
  document: IStructureDocument;
  lifecycle: IStructureLifecycle;
  timeline: ITimelineEvent[];
  related_documents: IRelatedDocumentLink[];
}

// Поля письма из реестра, которые нужны блоку структуры: реестр отдаёт
// документы нетипизированными, здесь фиксируем только используемый минимум.
export interface IStructureLetterRef {
  id: number;
  kind?: string;
  subject?: string;
  reg_number?: string | null;
  created_at?: string | null;
  sent_at?: string | null;
}

export interface IGroupedStructureLetters {
  label: string;
  items: any[];
}
