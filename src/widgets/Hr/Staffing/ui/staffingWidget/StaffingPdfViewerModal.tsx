import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, X } from 'lucide-react';
import { If } from '@shared/ui/If';

interface IProps {
  pdfViewerOpen: boolean;
  pdfFile: { name: string; url: string; size: string } | null;
  onClose: () => void;
  dark?: boolean;
}

export function StaffingPdfViewerModal({
  pdfViewerOpen,
  pdfFile,
  onClose,
  dark = false,
}: IProps) {
  return (
    <AnimatePresence>
      <If is={pdfViewerOpen && !!pdfFile}>
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative rounded-2xl shadow-2xl w-full max-w-4xl z-[61] flex flex-col ${
              dark ? 'bg-gray-900' : 'bg-white'
            }`}
            style={{ maxHeight: '90vh' }}
          >
            <div
              className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
                dark ? 'border-gray-700/60' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                  <FileText size={14} className="text-red-600" />
                </div>
                <p
                  className={`text-sm font-semibold truncate max-w-[280px] ${
                    dark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  {pdfFile?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfFile?.url}
                  download={pdfFile?.name}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    dark
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Download size={13} />
                  <span>Скачать</span>
                </a>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${
                    dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-2xl">
              <iframe
                src={pdfFile?.url}
                className="w-full h-full"
                style={{ minHeight: '70vh' }}
                title={pdfFile?.name}
              />
            </div>
          </motion.div>
        </div>
      </If>
    </AnimatePresence>
  );
}
