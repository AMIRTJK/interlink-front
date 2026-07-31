import React from "react";
import { motion } from "framer-motion";
import { Video, PhoneIncoming, PhoneMissed, Phone } from "lucide-react";
import { Contact } from "../../model";

interface IncomingCallScreenProps {
  contact: Contact;
  callType: "audio" | "video";
  onAccept: () => void;
  onDecline: () => void;
  declineLabel: string;
  acceptLabel: string;
  incomingVideoLabel: string;
  incomingVoiceLabel: string;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  contact,
  callType,
  onAccept,
  onDecline,
  declineLabel,
  acceptLabel,
  incomingVideoLabel,
  incomingVoiceLabel,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(24px)",
    }}
  >
    <motion.div
      initial={{ scale: 0.85, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-80 rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background:
          "linear-gradient(160deg,rgba(76,29,149,0.85) 0%,rgba(124,58,237,0.75) 50%,rgba(6,182,212,0.65) 100%)",
        border: "1px solid rgba(167,139,250,0.4)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 30px 80px rgba(124,58,237,0.5)",
      }}
    >
      <div className="pt-12 pb-8 flex flex-col items-center">
        <div className="relative mb-6">
          <motion.div
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full"
            style={{
              margin: "-18px",
              background:
                "radial-gradient(circle,rgba(167,139,250,0.4),transparent)",
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
            className="absolute inset-0 rounded-full"
            style={{
              margin: "-8px",
              background:
                "radial-gradient(circle,rgba(103,232,249,0.3),transparent)",
            }}
          />
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-28 h-28 rounded-full object-cover border-4 shadow-xl"
            style={{
              borderColor: "rgba(167,139,250,0.5)",
            }}
          />
        </div>
        <h2 className="text-white text-2xl font-bold tracking-tight">
          {contact.name}
        </h2>
        <div className="flex items-center gap-1.5 mt-1.5">
          {callType === "video" ? (
            <Video className="w-3.5 h-3.5 text-white/60" />
          ) : (
            <PhoneIncoming className="w-3.5 h-3.5 text-white/60" />
          )}
          <p className="text-white/60 text-sm">
            <span>
              {callType === "video" ? incomingVideoLabel : incomingVoiceLabel}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-10 pb-10">
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out"
          >
            <PhoneMissed className="w-7 h-7" />
          </motion.button>
          <span className="text-white/60 text-xs">{declineLabel}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-white text-violet-700 flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out"
          >
            {callType === "video" ? (
              <Video className="w-7 h-7" />
            ) : (
              <Phone className="w-7 h-7" />
            )}
          </motion.button>
          <span className="text-white/60 text-xs">{acceptLabel}</span>
        </div>
      </div>
    </motion.div>
  </motion.div>
);
