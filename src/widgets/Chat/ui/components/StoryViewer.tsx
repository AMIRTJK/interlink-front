import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Contact } from "../../model";

interface StoryViewerProps {
  contact: Contact;
  onClose: () => void;
  hoursAgo: string;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  contact,
  onClose,
  hoursAgo,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const iv = setInterval(
      () =>
        setProgress((p) => {
          if (p >= 100) {
            onClose();
            return 100;
          }
          return p + 2;
        }),
      100,
    );
    return () => clearInterval(iv);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgb(var(--th-shadow-rgb) / 0.92)",
        backdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-80 h-[540px] rounded-3xl overflow-hidden shadow-2xl"
      >
        <img
          src={contact.story || contact.avatar}
          alt={contact.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgb(var(--th-shadow-rgb)/0.5)] via-transparent to-[rgb(var(--th-shadow-rgb)/0.6)]" />
        <div className="absolute top-4 left-4 right-4 h-1 bg-[rgb(var(--th-on-accent-rgb)/0.2)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, rgb(var(--th-accent-rgb)), rgb(var(--th-accent-2-rgb)), rgb(var(--th-accent-3-rgb)))",
            }}
          />
        </div>
        <div className="absolute top-8 left-4 right-4 flex items-center gap-2">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-[rgb(var(--th-on-accent-rgb)/0.6)]"
          />
          <span className="text-[var(--th-on-accent)] font-semibold text-sm">
            {contact.name}
          </span>
          <span className="text-[var(--th-on-accent-faint)] text-xs ml-1">{hoursAgo}</span>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-full bg-[rgb(var(--th-on-accent-rgb)/0.2)] flex items-center justify-center text-[var(--th-on-accent)] transition-all duration-200 ease-in-out hover:bg-[rgb(var(--th-on-accent-rgb)/0.3)] hover:scale-110"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
