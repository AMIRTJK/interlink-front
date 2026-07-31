import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { ApproversPanel } from "./ApproversPanel";
import { SignersPanel } from "./SignersPanel";
import { VersionsPanel } from "./VersionsPanel";
import { TaskPanel } from "./TaskPanel";
import { AttachmentsPanel } from "./AttachmentsPanel";
import { FilePreviewModal } from "@features/Profile";
import {
  createApiFileFromAttachedFile,
  downloadAttachment,
  CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE,
} from "@widgets/CreateInternalCorrespondence";

import {
  contentStyle,
  CONTENT_CLASS,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_PAD_H,
  PAGE_PAD_V,
} from "./lib";

import { IncomingPreviewModalProps } from "./incomingPreviewModal/incomingPreviewModalModel";
import { useIncomingPreviewState } from "./incomingPreviewModal/useIncomingPreviewState";
import { PreviewHeaderToolbar } from "./incomingPreviewModal/PreviewHeaderToolbar";
import { PreviewSectionsToolbarBar } from "./incomingPreviewModal/PreviewSectionsToolbarBar";
import { PreviewApproversQuickBar } from "./incomingPreviewModal/PreviewApproversQuickBar";
import { PreviewActiveApproverPopover } from "./incomingPreviewModal/PreviewActiveApproverPopover";
import { PreviewThumbnailsSidebar } from "./incomingPreviewModal/PreviewThumbnailsSidebar";
import { PreviewFullApproversDrawer } from "./incomingPreviewModal/PreviewFullApproversDrawer";
import { PreviewStatusBar } from "./incomingPreviewModal/PreviewStatusBar";

export const IncomingPreviewModal: React.FC<IncomingPreviewModalProps> = (props) => {
  const {
    subject,
    inboundNumber,
    lastModified,
    fontSize = 14,
    onClose,
    signatures = [],
    approvals = [],
    versions = [],
    activeVersionId = null,
    onSelectVersion,
    panelsInToolbar = false,
    onTogglePanelsInToolbar,
    correspondenceId,
    canCreateAssignment = true,
  } = props;

  const state = useIncomingPreviewState(props);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
      {/* Подложка */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* Окно */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          bottom: 16,
          background: "#f1f5f9",
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Тулбар */}
        <PreviewHeaderToolbar
          subject={subject}
          inboundNumber={inboundNumber}
          scaleInput={state.scaleInput}
          onZoomOut={state.zoomOut}
          onZoomIn={state.zoomIn}
          onScaleInputChange={state.handleScaleInputChange}
          onScaleInputFocus={state.handleScaleInputFocus}
          onScaleInputBlur={state.handleScaleInputBlur}
          onScaleInputKeyDown={state.handleScaleInputKeyDown}
          onClose={onClose}
        />

        <If is={Boolean(panelsInToolbar)}>
          <PreviewSectionsToolbarBar
            sections={state.sections}
            panelsInToolbar={panelsInToolbar}
            onTogglePanelsInToolbar={onTogglePanelsInToolbar}
          />
        </If>

        <PreviewApproversQuickBar
          previewSigners={state.previewSigners}
          previewApprovers={state.previewApprovers}
          activeApprover={state.activeApprover}
          signedCount={state.signedCount}
          totalCount={state.totalCount}
          onToggleApprover={(a) =>
            state.setActiveApprover(state.activeApprover?.name === a.name ? null : a)
          }
          onOpenFullPanel={() => state.setApproversPanelOpen(true)}
        />

        <If is={!!state.activeApprover}>
          <PreviewActiveApproverPopover
            activeApprover={state.activeApprover}
            onClose={() => state.setActiveApprover(null)}
          />
        </If>

        {/* Контент */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            position: "relative",
          }}
        >
          {/* Боковая лента миниатюр */}
          <PreviewThumbnailsSidebar
            sheets={state.sheets}
            currentPage={state.currentPage}
            onScrollToPage={state.scrollToPage}
          />

          {/* Область прокрутки страниц */}
          <div
            ref={state.scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "32px 48px",
              gap: 24,
              background: "#e2e8f0",
              position: "relative",
            }}
          >
            {state.sheets.map((pageHtml, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  state.pageRefs.current[idx] = el;
                  if (idx === 0) {
                    state.canvasRef.current = el;
                  }
                }}
                style={{
                  width: PAGE_WIDTH * state.zoom,
                  height: PAGE_HEIGHT * state.zoom,
                  flexShrink: 0,
                  transition: "width 0.15s ease, height 0.15s ease",
                  position: "relative",
                }}
              >
                <If is={idx === 0}>
                  <div
                    ref={state.panelsGroupRef}
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
                      isOpen={state.signersOpen}
                      hideTab={panelsInToolbar}
                      onOpen={state.openSigners}
                      onClose={() => state.setSignersOpen(false)}
                      signatures={signatures}
                    />
                    <ApproversPanel
                      isOpen={state.approversOpen}
                      hideTab={panelsInToolbar}
                      onOpen={state.openApprovers}
                      onClose={() => state.setApproversOpen(false)}
                      approvals={approvals}
                    />
                    <If is={!panelsInToolbar}>
                      <div className="absolute z-20" style={{ left: -33, top: 10 }}>
                        <motion.button
                          onClick={() =>
                            state.showTaskPanel
                              ? state.setShowTaskPanel(false)
                              : state.openTask()
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
                            state.showTaskPanel
                              ? "bg-slate-50"
                              : canCreateAssignment && "hover:bg-slate-50"
                          )}
                          aria-label="Поручение"
                        >
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-indigo-500" />
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
                      </div>
                    </If>
                    <VersionsPanel
                      isOpen={state.versionsOpen}
                      hideTab={panelsInToolbar}
                      onOpen={state.openVersions}
                      onClose={() => state.setVersionsOpen(false)}
                      versions={versions}
                      activeVersionId={activeVersionId}
                      onSelectVersion={(versionId) => {
                        if (onSelectVersion) {
                          onSelectVersion(versionId);
                        }
                      }}
                    />
                    <AnimatePresence>
                      <If is={state.showTaskPanel}>
                        <TaskPanel
                          onClose={() => state.setShowTaskPanel(false)}
                          correspondenceId={correspondenceId || ""}
                        />
                      </If>
                    </AnimatePresence>
                    <AttachmentsPanel
                      isOpen={state.attachmentsOpen}
                      hideTab={panelsInToolbar}
                      onOpen={state.openAttachments}
                      onClose={() => state.setAttachmentsOpen(false)}
                      attachments={state.mappedAttachments}
                      onPreview={(file) => state.setPreviewAttachment(file)}
                      onDownload={(file) => downloadAttachment(file)}
                    />
                  </div>
                </If>
                <div
                  style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    transform: `scale(${state.zoom})`,
                    transformOrigin: "top left",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: PAGE_WIDTH,
                      height: PAGE_HEIGHT,
                      background: "white",
                      boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
                      padding: `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className={CONTENT_CLASS}
                      style={{ ...contentStyle(fontSize), height: "100%" }}
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />

                    <If
                      is={Boolean(
                        state.stamp &&
                          state.stamp.pageIndex === idx &&
                          state.stamp.html
                      )}
                    >
                      <div
                        onClick={(e) => {
                          const src = e.currentTarget
                            .querySelector("img")
                            ?.getAttribute("src");
                          if (src) state.setZoomedStampSrc(src);
                        }}
                        title="Нажмите, чтобы посмотреть в полном размере"
                        style={{
                          position: "absolute",
                          left: PAGE_PAD_H + (state.stamp?.x ?? 0),
                          top: PAGE_PAD_V + (state.stamp?.y ?? 0),
                          width: state.stamp?.width,
                          height: "auto",
                          overflow: "hidden",
                          cursor: "zoom-in",
                          zIndex: 50,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: state.stamp?.html || "",
                        }}
                      />
                    </If>

                    <span
                      style={{
                        position: "absolute",
                        bottom: 24,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        fontSize: 11,
                        color: "#94a3b8",
                        fontFamily: "system-ui, sans-serif",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      Страница {idx + 1} из {state.sheets.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PreviewFullApproversDrawer
            isOpen={state.approversPanelOpen}
            onClose={() => state.setApproversPanelOpen(false)}
            signedCount={state.signedCount}
            totalCount={state.totalCount}
            progressPct={state.progressPct}
            roleFilter={state.roleFilter}
            onRoleFilterChange={state.setRoleFilter}
            panelSearch={state.panelSearch}
            onPanelSearchChange={state.setPanelSearch}
            filteredSigners={state.filteredSigners}
            filteredApprovers={state.filteredApprovers}
          />
        </div>

        {/* Статус-бар */}
        <PreviewStatusBar
          sheetCount={state.sheets.length}
          lastModified={lastModified}
        />
      </div>

      <If is={!!state.previewAttachment}>
        <FilePreviewModal
          file={createApiFileFromAttachedFile(state.previewAttachment!)}
          onClose={() => state.setPreviewAttachment(null)}
          unavailableNotice={CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE}
        />
      </If>

      {createPortal(
        <AnimatePresence>
          {state.zoomedStampSrc && (
            <motion.div
              key="ds-doc-preview-zoom"
              className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-sans"
              onClick={() => state.setZoomedStampSrc(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      Электронная подпись
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => state.setZoomedStampSrc(null)}
                    aria-label="Закрыть"
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>
                <img
                  src={state.zoomedStampSrc}
                  alt="Электронная подпись"
                  className="block w-full h-auto select-none"
                  draggable={false}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};
