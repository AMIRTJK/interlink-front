import React, { useState } from "react";
import { createPortal } from "react-dom";

import { ExecutorsEmptyState } from "./ExecutorsEmptyState";
import { VisaForm } from "@features/visa-form";
import { HeaderExecutionModal } from "./HeaderExecutionModal";
import { If } from "@shared/ui";
import { ExecutorStructure } from "@features/executor-structure";

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  correspondenceId?: number;
}

export const ExecutionModal: React.FC<ExecutionModalProps> = ({
  isOpen,
  onClose,
  correspondenceId,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showExecutorStructure, setShowExecutorStructure] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const handleSaveExecutors = (selected: number[], mains: number[]) => {
    console.log("Selected Users:", selected);
    console.log("Main Executors:", mains);
    // Тут логика сохранения или передачи данных обратно в форму
    setShowExecutorStructure(false);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-gray-700/60 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div
        className={`
          bg-white shadow-2xl flex flex-col overflow-hidden md:p-6 relative transition-all duration-300 ease-in-out
          ${
            isFullScreen
              ? "w-full h-full rounded-none"
              : "w-full h-full md:w-[calc(100vw-100px)] md:h-[calc(100vh-100px)] rounded-none md:rounded-2xl"
          }
        `}
      >
        <HeaderExecutionModal
          toggleFullScreen={toggleFullScreen}
          onClose={onClose}
          isFullScreen={isFullScreen}
        />
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden bg-[#F5F7FB]  md:bg-white">
          <VisaForm
            correspondenceId={correspondenceId}
            className="w-full md:w-96 md:rounded-2xl bg-[#F2F5FF] p-4 border-b md:border-b-0 md:border-r border-gray-100 shrink-0"
            onAssignExecutors={() => setShowExecutorStructure(true)}
          />
          <div className="flex-1 pl-4 bg-white relative flex flex-col items-center justify-center text-center min-h-[300px]">
            <If is={showExecutorStructure}>
              <ExecutorStructure
                onCancel={() => setShowExecutorStructure(false)}
                onSave={handleSaveExecutors}
                className="w-full h-full animate-fade-in"
              />
            </If>
            <If is={!showExecutorStructure}>
              <ExecutorsEmptyState
                onAssignExecutors={() => setShowExecutorStructure(true)}
              />
            </If>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
