import React, { useState } from "react";
import { pdfjs } from "react-pdf";

import "./style.css";
import { DocPreview } from "./ui/DocPreview";
import { DocSidebar } from "./ui/DocSidebar";
import { IDocFile, IDocView } from "./model";
import { Modal } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { If } from "@shared/ui";
import { LetterExecution } from "@features/ResolutionCard";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const DocView: React.FC<IDocView> = ({
  files = [],
  open,
  bookOpen,
  onClose,
  closable = false,
}) => {
  const mockFiles: IDocFile[] = [
    { id: 1, name: "Договор.pdf", url: "/files/contract.pdf", type: "pdf" },
    { id: 2, name: "Смета.xls", url: "/files/budget.xls", type: "xls" },
    { id: 3, name: "Инструкция.doc", url: "/files/manual.doc", type: "doc" },
    { id: 3, name: "Инструкция.doc", url: "/files/manual.doc", type: "doc" },
    { id: 3, name: "Инструкция.doc", url: "/files/manual.doc", type: "doc" },
  ];

  const [activeFile, setActiveFile] = useState(mockFiles[0]);

  const [isSetExecutor, setIsSetExecutor] = useState<boolean>(false);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      closable={closable}
      transitionName=""
      maskTransitionName="ant-fade"
      destroyOnClose={true}
      styles={{
        body: { padding: 0 },
        mask: {
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        },
      }}
      className="modal-doc"
      modalRender={(modal) => (
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key="modal-motion"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                x: bookOpen ? 300 : 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 40,
                transition: { duration: 0.5 },
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                x: { duration: 1.2, ease: [0.645, 0.045, 0.355, 1] },
              }}
              style={{ pointerEvents: "auto" }}
            >
              {modal}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    >
      <div className={`card ${bookOpen ? "is-open" : ""}`}>
        <div className="cover">
          <DocPreview fileUrl={mockFiles[0].url} docName={mockFiles[0].name} />
        </div>
        <div className="content">
          <DocSidebar
            files={mockFiles}
            activeFileId={activeFile?.id}
            onFileSelect={setActiveFile}
          />
          <If is={isSetExecutor}>
            <LetterExecution />
          </If>
        </div>
      </div>
    </Modal>
  );
};
