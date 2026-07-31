export interface Recipient {
  id: number;
  full_name: string;
  position: string;
  photo_path: string | null;
}

export type SelectionMode = "recipients" | "copy" | null;
