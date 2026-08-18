import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@shared/lib";
import { If, Tooltip } from "@shared/ui";
import { DocumentCanvas } from "../DocumentCanvas";
import { PAGE_WIDTH } from "../lib";
import { ApproversPanel } from "../ApproversPanel";
import { SignersPanel } from "../SignersPanel";
import { VersionsPanel } from "../VersionsPanel";
import { TaskPanel } from "../TaskPanel";
import { VisorsPanel } from "../VisorsPanel";
import { AttachmentsPanel } from "../AttachmentsPanel";
import { VISOR_INVITE_HINT } from "../model";
import { AttachedFile } from "@widgets/CreateInternalCorrespondence";

interface IProps {
  isResolvingBody: boolean;
  documentBody: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  panelsGroupRef: React.RefObject<HTMLDivElement | null>;
  panelsInToolbar: boolean;
  signersOpen: boolean;
  openSigners: () => void;
  setSignersOpen: (val: boolean) => void;
  signatures: any[];
  approversOpen: boolean;
  openApprovers: () => void;
  setApproversOpen: (val: boolean) => void;
  approvals: any[];
  showTaskPanel: boolean;
  setShowTaskPanel: (val: boolean) => void;
  openTask: () => void;
  canCreateAssignment: boolean;
  assignmentsCount: number;
  isVisorsAvailable: boolean;
  visorsOpen: boolean;
  openVisors: () => void;
  setVisorsOpen: (val: boolean) => void;
  visors: any[];
  attachmentsOpen: boolean;
  openAttachments: () => void;
  setAttachmentsOpen: (val: boolean) => void;
  mappedAttachments: AttachedFile[];
  onPreviewAttachment: (file: AttachedFile) => void;
  onDownloadAttachment: (file: AttachedFile) => void;
  versionsOpen: boolean;
  openVersions: () => void;
  setVersionsOpen: (val: boolean) => void;
  docVersions: any[];
  activeVersionId: number | string | null;
  onSelectVersion: (id: number | string) => void;
  correspondenceId: number | string;
  loadingVisors: boolean;
  canInviteVisor: boolean;
}

export const IncomingViewCanvasPanels: React.FC<IProps> = ({
  isResolvingBody,
  documentBody,
  canvasRef,
  panelsGroupRef,
  panelsInToolbar,
  signersOpen,
  openSigners,
  setSignersOpen,
  signatures,
  approversOpen,
  openApprovers,
  setApproversOpen,
  approvals,
  showTaskPanel,
  setShowTaskPanel,
  openTask,
  canCreateAssignment,
  assignmentsCount,
  isVisorsAvailable,
  visorsOpen,
  openVisors,
  setVisorsOpen,
  visors,
  attachmentsOpen,
  openAttachments,
  setAttachmentsOpen,
  mappedAttachments,
  onPreviewAttachment,
  onDownloadAttachment,
  versionsOpen,
  openVersions,
  setVersionsOpen,
  docVersions,
  activeVersionId,
  onSelectVersion,
  correspondenceId,
  loadingVisors,
  canInviteVisor,
}) => {
  return (
    <div className="flex flex-1 w-full relative">
      <div className="flex-1 overflow-x-auto bg-[#E8EAED] flex items-start justify-center py-8 px-8">
        {isResolvingBody ? (
          <div className="flex flex-col items-center gap-2 text-slate-400 py-20">
            <Loader2 size={22} className="animate-spin text-blue-500" />
            <span className="text-xs font-semibold">
              Загрузка документа...
            </span>
          </div>
        ) : (
          <div
            ref={canvasRef}
            className="relative shrink-0"
            style={{ width: PAGE_WIDTH }}
          >
            <DocumentCanvas html={documentBody} />
            <div
              ref={panelsGroupRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 0,
                zIndex: 500,
                willChange: "transform",
              }}
            >
              <SignersPanel
                isOpen={signersOpen}
                hideTab={panelsInToolbar}
                onOpen={openSigners}
                onClose={() => setSignersOpen(false)}
                signatures={signatures}
              />
              <ApproversPanel
                isOpen={approversOpen}
                hideTab={panelsInToolbar}
                onOpen={openApprovers}
                onClose={() => setApproversOpen(false)}
                approvals={approvals}
                activeVersionId={activeVersionId}
              />
              {!panelsInToolbar && (
                <div className="absolute z-20" style={{ left: -33, top: 10 }}>
                  <Tooltip
                    title={canCreateAssignment ? undefined : VISOR_INVITE_HINT}
                  >
                    <motion.button
                      onClick={() =>
                        showTaskPanel ? setShowTaskPanel(false) : openTask()
                      }
                      disabled={!canCreateAssignment}
                      whileHover={
                        canCreateAssignment ? { scale: 1.02 } : undefined
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                      }}
                      className={cn(
                        "bg-white border border-slate-200 border-r-0 rounded-l-xl shadow-md px-2 py-3 h-[160px] flex flex-col items-center gap-1.5 select-none transition-all duration-200",
                        canCreateAssignment
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-60",
                        showTaskPanel
                          ? "bg-slate-50"
                          : canCreateAssignment && "hover:bg-slate-50"
                      )}
                      aria-label="Поручение"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-indigo-500" />
                        <If is={assignmentsCount > 0}>
                          <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {assignmentsCount}
                          </span>
                        </If>
                      </div>
                      <span
                        style={{
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#475569",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Поручение
                      </span>
                    </motion.button>
                  </Tooltip>
                </div>
              )}

              <AttachmentsPanel
                isOpen={attachmentsOpen}
                hideTab={panelsInToolbar}
                openLeft={true}
                onOpen={openAttachments}
                onClose={() => setAttachmentsOpen(false)}
                attachments={mappedAttachments}
                onPreview={onPreviewAttachment}
                onDownload={onDownloadAttachment}
              />

              <VersionsPanel
                isOpen={versionsOpen}
                hideTab={panelsInToolbar}
                onOpen={openVersions}
                onClose={() => setVersionsOpen(false)}
                versions={docVersions}
                activeVersionId={activeVersionId}
                onSelectVersion={onSelectVersion}
              />
              <AnimatePresence>
                {showTaskPanel && (
                  <TaskPanel
                    correspondenceId={correspondenceId}
                    onClose={() => setShowTaskPanel(false)}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visorsOpen && (
                  <VisorsPanel
                    correspondenceId={correspondenceId}
                    visors={visors}
                    isLoading={Boolean(loadingVisors)}
                    canInvite={canInviteVisor}
                    onClose={() => setVisorsOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
