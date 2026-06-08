import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye } from "lucide-react";
import type { PageOrientation } from "../types";
import { DSStamp } from "./DSStamp";

export const PreviewModal = ({
  subject,
  editorHtml,
  orientation,
  onClose,
  stampVisible,
  stampPos,
  stampSize,
  stampSignerName,
  stampCertSerial,
  stampSignedAt,
  stampValidUntil,
}: {
  subject: string;
  editorHtml: string;
  orientation: PageOrientation;
  onClose: () => void;
  stampVisible: boolean;
  stampPos: { x: number; y: number };
  stampSize: { width: number; height: "auto" | number };
  stampSignerName: string;
  stampCertSerial: string;
  stampSignedAt: string;
  stampValidUntil: string;
}) => {
  const isLandscape = orientation === "landscape";
  const pageWidth = isLandscape ? 1122 : 794;
  const pageHeight = isLandscape ? 794 : 1122;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-slate-700/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-600"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Eye size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Предварительный просмотр
              </p>
              <p className="text-xs text-slate-400">
                {isLandscape ? "Альбомная ориентация" : "Книжная ориентация"} ·
                A4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <X size={15} />
            <span>Закрыть</span>
          </button>
        </div>
        <div
          className="flex-1 overflow-auto flex items-start justify-center py-10 px-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white shadow-2xl"
            style={{
              width: pageWidth,
              minHeight: pageHeight,
              padding: "72px 80px",
              fontFamily: "Times New Roman, serif",
              fontSize: 14,
              lineHeight: 2,
              color: "#1e293b",
              position: "relative",
            }}
          >
            {editorHtml ? (
              <div dangerouslySetInnerHTML={{ __html: editorHtml }} />
            ) : (
              <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                Текст письма не введён...
              </p>
            )}
            {stampVisible && (
              <div
                style={{
                  position: "absolute",
                  left: stampPos.x,
                  top: stampPos.y,
                  width: stampSize.width,
                  height:
                    stampSize.height === "auto" ? undefined : stampSize.height,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <DSStamp
                  name={stampSignerName}
                  certSerial={stampCertSerial}
                  signedAt={stampSignedAt}
                  validUntil={stampValidUntil}
                />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
