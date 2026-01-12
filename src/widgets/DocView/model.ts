export interface IDocFile {
  id: number;
  name: string;
  url: string;
  type: "pdf" | "xls" | "doc";
}

export interface IDocView {
  docName?: string;
  fileUrl?: string;
  files?: IDocFile[];
  onClose: () => void;
  open: boolean;
  bookOpen: boolean;
  closable?: boolean;
  isAnimationFinished?: boolean;
}
