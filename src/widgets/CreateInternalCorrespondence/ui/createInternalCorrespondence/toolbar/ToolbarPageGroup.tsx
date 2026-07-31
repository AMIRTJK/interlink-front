import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import { FilePlus2, FileType, Monitor } from "lucide-react";

import { cn } from "../../../lib/utils";
import type { PageOrientation } from "../../../types";

interface IProps {
  isReadOnly: boolean;
  insertPageBreak: () => void;
  orientation: PageOrientation;
  setOrientation: Dispatch<SetStateAction<PageOrientation>>;
  importingWord: boolean;
  wordInputRef: RefObject<HTMLInputElement | null>;
  handleImportWord: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ToolbarPageGroup = ({
  isReadOnly,
  insertPageBreak,
  orientation,
  setOrientation,
  importingWord,
  wordInputRef,
  handleImportWord,
}: IProps) => (
  <>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        insertPageBreak();
      }}
      disabled={isReadOnly}
      title="Разрыв страницы: текст после курсора начнётся с нового листа"
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0",
        isReadOnly
          ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100",
      )}
    >
      <FilePlus2 size={14} />
      <span>Новая страница</span>
    </button>
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        setOrientation((o) =>
          o === "portrait" ? "landscape" : "portrait",
        );
      }}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0",
        orientation === "landscape"
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100",
      )}
    >
      <Monitor size={16} />
      <span>
        {orientation === "portrait" ? "Книжный" : "Альбомный"}
      </span>
    </button>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    {!isReadOnly && (
      <>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            if (!importingWord) wordInputRef.current?.click();
          }}
          disabled={importingWord}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FileType size={14} />
          <span>
            {importingWord ? "Импорт…" : "Импорт Word"}
          </span>
        </button>
        <input
          ref={wordInputRef}
          type="file"
          accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleImportWord}
        />
      </>
    )}
  </>
);
