import React from "react";
import { motion } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Volume2, PhoneOff, X } from "lucide-react";
import { Contact } from "../../model";
import { Translations } from "../../lib/translations";
import { formatDuration } from "../../lib/chatHelpers";

interface CallOverlayModalProps {
  callState: "audio" | "video";
  activeContact: Contact;
  isVideoOff: boolean;
  isMuted: boolean;
  callDuration: number;
  t: Translations;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onClose: () => void;
}

export const CallOverlayModal: React.FC<CallOverlayModalProps> = ({
  callState,
  activeContact,
  isVideoOff,
  isMuted,
  callDuration,
  t,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onClose,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{
      background: "var(--th-scrim)",
      backdropFilter: "blur(20px)",
    }}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-2xl h-[560px] rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background:
          "var(--th-action-bg)",
        border: "1px solid var(--th-bubble-out-border)",
        backdropFilter: "blur(30px)",
        boxShadow: "0 30px 80px rgb(var(--th-accent-rgb) / 0.5)",
      }}
    >
      {callState === "video" && !isVideoOff ? (
        <div className="w-full h-full">
          <img
            src={activeContact.avatar}
            alt={activeContact.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--th-shadow-rgb)/0.6)] via-transparent to-[rgb(var(--th-shadow-rgb)/0.3)]" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <div
              className="absolute inset-0 rounded-full opacity-40 animate-ping"
              style={{
                background:
                  "radial-gradient(circle, rgb(var(--th-accent-2-rgb) / 0.6), transparent)",
              }}
            />
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="relative w-40 h-40 rounded-full object-cover"
              style={{
                border: "4px solid var(--th-bubble-out-border)",
              }}
            />
          </motion.div>
        </div>
      )}
      {callState === "video" && (
        <div
          className="absolute top-5 right-5 w-32 h-44 rounded-2xl overflow-hidden shadow-lg"
          style={{
            border: "2px solid rgb(var(--th-on-accent-rgb) / 0.2)",
            background: "rgb(var(--th-shadow-rgb) / 0.5)",
          }}
        >
          {!isVideoOff ? (
            <img
              src="https://i.pravatar.cc/150?img=5"
              alt="You"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-[var(--th-on-accent-faint)]" />
            </div>
          )}
        </div>
      )}
      <div className="absolute top-0 left-0 right-0 p-6 text-[var(--th-on-accent)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold drop-shadow">
              {activeContact.name}
            </h2>
            <p className="text-sm text-[var(--th-on-accent-muted)] mt-1">
              <span>
                {callState === "video"
                  ? t.videoCallLabel
                  : t.voiceCallLabel}
              </span>
              <span> · {formatDuration(callDuration)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
            style={{
              background: "rgb(var(--th-on-accent-rgb) / 0.12)",
              border: "1px solid rgb(var(--th-on-accent-rgb) / 0.2)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onToggleMute}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 text-[var(--th-on-accent)]"
            style={{
              background: isMuted
                ? "rgb(var(--th-on-accent-rgb) / 0.9)"
                : "rgb(var(--th-on-accent-rgb) / 0.15)",
              border: "1px solid rgb(var(--th-on-accent-rgb) / 0.25)",
              color: isMuted ? "rgb(var(--th-accent-rgb))" : "var(--th-on-accent)",
            }}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          {callState === "video" && (
            <button
              onClick={onToggleVideo}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
              style={{
                background: isVideoOff
                  ? "rgb(var(--th-on-accent-rgb) / 0.9)"
                  : "rgb(var(--th-on-accent-rgb) / 0.15)",
                border: "1px solid rgb(var(--th-on-accent-rgb) / 0.25)",
                color: isVideoOff ? "rgb(var(--th-accent-rgb))" : "var(--th-on-accent)",
              }}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>
          )}
          <button
            className="w-14 h-14 rounded-full text-[var(--th-on-accent)] flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
            style={{
              background: "rgb(var(--th-on-accent-rgb) / 0.15)",
              border: "1px solid rgb(var(--th-on-accent-rgb) / 0.25)",
            }}
          >
            <Volume2 className="w-6 h-6" />
          </button>
          <button
            onClick={onEndCall}
            className="w-16 h-14 rounded-full bg-[rgb(var(--th-danger-rgb))] hover:bg-[rgb(var(--th-danger-rgb)/0.85)] text-[var(--th-on-accent)] flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-105 shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);
