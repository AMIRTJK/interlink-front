import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryEvent {
  label: string;
  date: string;
}

interface IProps {
  historyEvents: HistoryEvent[];
}

export const SignersPanelHistory: React.FC<IProps> = ({ historyEvents }) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
      <button
        onClick={() => setShowHistory((v) => !v)}
        className="w-full text-left flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
      >
        <span>История согласования</span>
        <motion.span
          animate={{ rotate: showHistory ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="inline-block"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 flex flex-col gap-2">
              {historyEvents.map((event, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-600 leading-tight">
                      {event.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
