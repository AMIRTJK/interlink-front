import React from "react";
import { Link2, ArrowRight } from "lucide-react";
import { If } from "@shared/ui";
import { IRelatedDocumentLink, IRelatedDocItem } from "../../lib/structure/types";

interface IRelatedDocsSectionProps {
  relatedDocuments?: IRelatedDocumentLink[];
  onDocClick?: (id: number) => void;
}

const DocBadge: React.FC<{
  doc?: IRelatedDocItem;
  label: string;
  onClick?: (id: number) => void;
}> = ({ doc, label, onClick }) => {
  if (!doc) return null;

  return (
    <div
      onClick={() => onClick?.(doc.id)}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-colors"
    >
      <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-400 tracking-wider">
        {label}:
      </span>
      <If is={Boolean(doc.reg_number)}>
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {doc.reg_number}
        </span>
      </If>
      <span className="text-xs text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
        {doc.subject || "Без темы"}
      </span>
    </div>
  );
};

export const RelatedDocsSection: React.FC<IRelatedDocsSectionProps> = ({
  relatedDocuments,
  onDocClick,
}) => {
  const hasItems = Boolean(relatedDocuments && relatedDocuments.length > 0);

  return (
    <If is={hasItems}>
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5 mb-2">
          <Link2 size={13} className="text-slate-400 dark:text-slate-400" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Связанные документы
          </span>
        </div>
        <div className="space-y-2">
          {relatedDocuments?.map((rel, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 flex-wrap text-xs bg-slate-50/50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60"
            >
              <DocBadge
                doc={rel.incoming}
                label="Входящее"
                onClick={onDocClick}
              />
              <If is={Boolean(rel.incoming && rel.outgoing)}>
                <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />
              </If>
              <DocBadge
                doc={rel.outgoing}
                label="Исходящее"
                onClick={onDocClick}
              />
            </div>
          ))}
        </div>
      </div>
    </If>
  );
};
