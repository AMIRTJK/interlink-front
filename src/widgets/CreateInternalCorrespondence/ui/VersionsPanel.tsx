import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { VersionItem } from "./VersionItem";

interface IProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  versions: any[];
  activeVersionId: number | string | null;
  signedVersionId: number | string | null;
  onSelectVersion: (content: string, id: number) => void;
  onSetVersionForSign: (id: number) => void;
  isSelectingVersion: boolean;
  isSigned: boolean;
}

export const VersionsPanel = ({
  isOpen,
  onOpen,
  onClose,
  versions = [],
  activeVersionId,
  signedVersionId,
  onSelectVersion,
  onSetVersionForSign,
  isSelectingVersion,
  isSigned,
}: IProps) => {
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  const versionAuthors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    versions.forEach((v) => {
      const auth = v.author;
      if (!auth?.id) return;
      const id = String(auth.id);
      const existing = map.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(id, { id, name: auth.name, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [versions]);

  const filteredVersions = useMemo(() => {
    if (!selectedAuthorId) return versions;
    return versions.filter((v) => String(v.author?.id) === selectedAuthorId);
  }, [versions, selectedAuthorId]);

  return (
    <>
      <div className="absolute z-20" style={{ left: -36, top: 190 }}>
        <motion.button
          onClick={isOpen ? onClose : onOpen}
          className={cn(
            "bg-white border border-slate-200 border-r-0 rounded-l-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
            isOpen ? "bg-slate-50" : "hover:bg-slate-50"
          )}
          aria-label="История версий"
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-amber-500" />
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
            История версий
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
            style={{
              right: "calc(100% + 12px)",
              maxHeight: "var(--icc-panel-max-h, 70vh)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-slate-800">
                  История версий
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 ml-2 font-medium">
                  {versions.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700"
                aria-label="Закрыть панель версий"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center z-40 relative">
              <span className="text-xs text-slate-500 font-medium">
                Версии документа
              </span>
              <If is={versionAuthors.length > 0}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAuthorDropdown((v) => !v)}
                    className={cn(
                      "w-30 flex items-center justify-between gap-2 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer text-left",
                      selectedAuthorId
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <Search
                        size={11}
                        className={cn(
                          "flex-shrink-0",
                          selectedAuthorId ? "text-amber-500" : "text-slate-400"
                        )}
                      />
                      <span className="truncate block flex-1 pr-1">
                        {selectedAuthorId
                          ? versionAuthors.find((a) => a.id === selectedAuthorId)?.name
                          : "Все авторы"}
                      </span>
                    </div>
                    <ChevronDown
                      size={11}
                      className={cn(
                        "transition-transform text-slate-400 flex-shrink-0",
                        showAuthorDropdown && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {showAuthorDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden w-56 py-1"
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedAuthorId(null);
                            setShowAuthorDropdown(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 font-medium",
                            !selectedAuthorId
                              ? "bg-slate-50 text-blue-600 font-bold"
                              : "text-slate-700"
                          )}
                        >
                          <span>Все авторы</span>
                          <If is={!selectedAuthorId}>
                            <Check size={12} className="text-blue-500" />
                          </If>
                        </button>

                        {versionAuthors.map((auth) => {
                          const isSelected = selectedAuthorId === auth.id;
                          return (
                            <button
                              type="button"
                              key={auth.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedAuthorId(auth.id);
                                setShowAuthorDropdown(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50",
                                isSelected
                                  ? "bg-slate-50 text-blue-600 font-bold"
                                  : "text-slate-600"
                              )}
                            >
                              <span className="truncate pr-2">{auth.name}</span>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-mono">
                                  {auth.count}
                                </span>
                                <If is={isSelected}>
                                  <Check size={12} className="text-blue-500" />
                                </If>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </If>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
              <If is={filteredVersions.length === 0}>
                <p className="text-xs text-slate-400 text-center py-4">
                  Нет версий от этого автора
                </p>
              </If>
              <If is={filteredVersions.length > 0}>
                {filteredVersions.map((v) => (
                  <VersionItem
                    key={v.id}
                    version={v}
                    activeVersionId={activeVersionId}
                    signedVersionId={signedVersionId}
                    isSelectingVersion={isSelectingVersion}
                    isSigned={isSigned}
                    onSelectVersion={onSelectVersion}
                    onSetVersionForSign={onSetVersionForSign}
                  />
                ))}
              </If>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
