import { motion } from "framer-motion";
import { Search, Phone, Video, UserCog, MoreVertical } from "lucide-react";
import type { Contact } from "../../model";
import { Translations } from "../../lib/translations";

// Шапка открытой беседы: собеседник, его статус и действия над беседой.

interface IProps {
  activeContact: Contact;
  isDark: boolean;
  t: Translations;
  showMsgSearch: boolean;
  showContactDrawer: boolean;
  onToggleSearch: () => void;
  onToggleDrawer: () => void;
  onStartCall: (type: "audio" | "video") => void;
  onSimulateIncomingCall: () => void;
}

export const ChatSubHeader = ({
  activeContact,
  isDark,
  t,
  showMsgSearch,
  showContactDrawer,
  onToggleSearch,
  onToggleDrawer,
  onStartCall,
  onSimulateIncomingCall,
}: IProps) => (
  <div
    className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${isDark ? "border-white/8" : "border-black/6"}`}
    style={{
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
      backdropFilter: "blur(10px)",
    }}
  >
    <motion.div
      key={`header-${activeContact.id}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex items-center gap-3"
    >
      <div className="relative">
        <img
          src={activeContact.avatar}
          alt={activeContact.name}
          className="w-10 h-10 rounded-full object-cover overflow-hidden"
          style={{ boxShadow: "inset 0 0 0 2px rgba(196,181,253,0.4)" }}
        />
        {activeContact.online && (
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-transparent rounded-full"
            style={{ boxShadow: "0 0 6px rgba(74,222,128,0.7)" }}
          />
        )}
      </div>
      <div>
        <h2
          className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {activeContact.name}
        </h2>
        <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>
          {activeContact.isGroup
            ? `${activeContact.membersCount ?? 0} ${t.contacts}`
            : activeContact.online
              ? t.online
              : t.lastSeen}
        </p>
      </div>
    </motion.div>
    <div className="flex items-center gap-1">
      <button
        onClick={onToggleSearch}
        aria-label={t.searchMessages}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${showMsgSearch ? "bg-violet-500/30 text-violet-300" : isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
      >
        <Search className="w-4.5 h-4.5" />
      </button>
      <button
        onClick={onSimulateIncomingCall}
        aria-label={t.simulateCall}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-amber-500 transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-amber-500/15" : "hover:bg-amber-50"}`}
      >
        <Phone className="w-4.5 h-4.5" />
      </button>
      <button
        onClick={() => onStartCall("video")}
        aria-label={t.videoCall}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
      >
        <Video className="w-4.5 h-4.5" />
      </button>
      <button
        onClick={() => onStartCall("audio")}
        aria-label={t.audioCall}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
      >
        <Phone className="w-4.5 h-4.5" />
      </button>
      <button
        onClick={onToggleDrawer}
        aria-label={t.contactInfo}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${showContactDrawer ? "bg-violet-500/30 text-violet-500" : isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
      >
        <UserCog className="w-4.5 h-4.5" />
      </button>
      <div className={`w-px h-5 mx-1 ${isDark ? "bg-white/15" : "bg-black/10"}`} />
      <button
        onClick={onToggleDrawer}
        aria-label={t.contactInfo}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110 hover:brightness-110"
        style={{
          background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
          boxShadow: isDark
            ? "0 0 16px rgba(124,58,237,0.5)"
            : "0 0 12px rgba(124,58,237,0.35)",
        }}
      >
        <MoreVertical className="w-4.5 h-4.5" />
      </button>
    </div>
  </div>
);
