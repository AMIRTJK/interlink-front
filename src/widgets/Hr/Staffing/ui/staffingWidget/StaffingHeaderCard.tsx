import React from 'react';
import { GitBranch, FileText, Eye, Download, X, Upload } from 'lucide-react';
import { If } from '@shared/ui/If';
import { SummaryBar } from '../SummaryBar';
import type { ISubOrganization } from '../../model';

interface IProps {
  dark?: boolean;
  headerCardBg: string;
  titleText: string;
  subText: string;
  pdfBg: string;
  pdfUploadBtn: string;
  pdfFile: { name: string; url: string; size: string } | null;
  pdfInputRef: React.RefObject<HTMLInputElement | null>;
  onPdfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPdfViewer: () => void;
  onClearPdf: () => void;
  organizations: ISubOrganization[];
  allTotals: {
    totalDepts: number;
    totalPositions: number;
    totalSlots: number;
    totalOccupied: number;
    occupancyPct: number;
  };
}

export function StaffingHeaderCard({
  dark = false,
  headerCardBg,
  titleText,
  subText,
  pdfBg,
  pdfUploadBtn,
  pdfFile,
  pdfInputRef,
  onPdfChange,
  onOpenPdfViewer,
  onClearPdf,
  organizations,
  allTotals,
}: IProps) {
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${headerCardBg}`}>
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GitBranch size={15} className="text-white" />
            </div>
            <h2 className={`text-lg font-bold ${titleText}`}>Штатное расписание</h2>
          </div>
          <p className={`text-sm ml-10 ${subText}`}>
            Управление структурой организаций, отделов и должностей
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={onPdfChange}
          />
          <If is={!!pdfFile}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${pdfBg}`}
            >
              <FileText size={13} />
              <span className="truncate max-w-[120px]">{pdfFile?.name}</span>
              <span className="opacity-60 text-[10px]">{pdfFile?.size}</span>
              <button
                onClick={onOpenPdfViewer}
                className="p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <Eye size={12} />
              </button>
              <a
                href={pdfFile?.url}
                download={pdfFile?.name}
                className="p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <Download size={12} />
              </a>
              <button
                onClick={onClearPdf}
                className="p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </If>
          <If is={!pdfFile}>
            <button
              onClick={() => pdfInputRef.current?.click()}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${pdfUploadBtn}`}
            >
              <Upload size={13} />
              <span>Прикрепить PDF</span>
            </button>
          </If>
        </div>
      </div>
      <If is={organizations.length > 0}>
        <div className="px-6 pb-5">
          <SummaryBar organizations={organizations} {...allTotals} dark={dark} />
        </div>
      </If>
    </div>
  );
}
