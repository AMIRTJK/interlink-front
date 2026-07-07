import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { If } from "@shared/ui";
import {
  Search,
  UserPlus,
  Plus,
  MoreVertical,
  Video,
  Phone,
  UserCog,
  Send,
  Smile,
  Paperclip,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  X,
  Volume2,
  FileText,
  ImageIcon,
  Film,
  Music,
  PhoneIncoming,
  PhoneMissed,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Star,
  ChevronRight,
  Pin,
  SearchIcon,
  ChevronDown,
  ChevronUp,
  Edit3,
  Grid3X3,
  Forward,
  Trash2,
  CornerUpLeft,
  Sparkles,
  Square,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Clock3,
  Trash,
  MessageCircleOff,
  AlertTriangle,
  Languages,
  PanelLeft,
  PanelRight,
  PanelBottom,
  PanelTop,
} from "lucide-react";
import {
  TRANSLATIONS,
  type Lang,
  type Translations,
} from "../lib/translations";

// ─── Types ────────────────────────────────────────────────────────────────────
type Contact = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  online: boolean;
  isGroup?: boolean;
  recent?: boolean;
  unreadCount?: number;
  email?: string;
  location?: string;
  joined?: string;
  bio?: string;
  mutualGroups?: string[];
  story?: string;
};
type MessageAttachment = {
  name: string;
  size: string;
  type: "image" | "video" | "audio" | "file" | "voice";
  preview?: string;
  duration?: number;
};
type MessageReaction = {
  emoji: string;
  count: number;
  reactedByMe: boolean;
};
type ReplyPreview = {
  id: string;
  senderName: string;
  text: string;
};
type Message = {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  attachment?: MessageAttachment;
  reactions?: MessageReaction[];
  pinned?: boolean;
  replyTo?: ReplyPreview;
  forwarded?: boolean;
  threadCount?: number;
  threadMessages?: Message[];
  deleted?: boolean;
  deletedForMe?: boolean;
  scheduled?: boolean;
  scheduledTime?: string;
};
type EmojiCategory = {
  label: string;
  emojis: string[];
};
type DrawerTab = "info" | "media";
type PendingFile = {
  name: string;
  size: string;
  type: MessageAttachment["type"];
  preview?: string;
  raw: File;
};
type LayoutPosition = "left" | "right" | "bottom" | "top";

// ─── Static Data ──────────────────────────────────────────────────────────────
const EMOJI_CATEGORY_EMOJIS: string[][] = [
  [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "🥲",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "😔",
    "😪",
    "🤤",
    "😴",
  ],
  [
    "👋",
    "🤚",
    "🖐",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "🫶",
    "👐",
    "🤲",
    "🙏",
    "✍",
    "💅",
    "🤳",
    "💪",
    "🦾",
  ],
  [
    "❤",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❤‍🔥",
    "❤‍🩹",
    "❣",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "♥",
    "🫀",
  ],
  [
    "🌸",
    "🌺",
    "🌻",
    "🌹",
    "🌷",
    "🌼",
    "💐",
    "🍀",
    "🌿",
    "☘",
    "🍃",
    "🌱",
    "🌲",
    "🌳",
    "🌴",
    "🌵",
    "🎋",
    "🎍",
    "🍄",
    "🌾",
    "🌊",
    "🌈",
    "⭐",
    "🌙",
    "☀",
    "⛅",
    "🌤",
    "🌦",
  ],
  [
    "🍕",
    "🍔",
    "🍟",
    "🌭",
    "🥪",
    "🥙",
    "🧆",
    "🌮",
    "🌯",
    "🫔",
    "🍳",
    "🥘",
    "🫕",
    "🍲",
    "🥗",
    "🍿",
    "🍱",
    "🍘",
    "🍙",
    "🍚",
    "🍛",
    "🍜",
    "🍝",
    "🍞",
    "🥐",
    "🥖",
    "🫓",
    "🥨",
  ],
];
const EMOJI_CATEGORIES_KEYS = [
  "smileys",
  "gestures",
  "hearts",
  "nature",
  "food",
] as const;
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
const SAMPLE_MEDIA_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&q=80",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=200&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200&q=80",
  "https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=200&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=80",
];
const AI_SUGGESTIONS = [
  "Sure, that sounds great! Let me know when you are free.",
  "Thanks for sharing! I will review it and get back to you soon.",
  "Interesting point! Could you elaborate a bit more on that?",
  "Absolutely, I agree with you on this one.",
  "I will take care of it right away!",
  "That makes sense. Let me think about it and respond shortly.",
];
const STORY_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&q=80",
];
const contacts: Contact[] = [
  {
    id: "1",
    name: "Stephen Ramirez",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Lorem ipsum is simply dummy..",
    online: true,
    unreadCount: 3,
    email: "stephen.r@example.com",
    location: "New York, USA",
    joined: "March 2021",
    bio: "Design enthusiast & coffee lover.",
    mutualGroups: ["Design Team", "Friday Lunch"],
    story: STORY_IMAGES[0],
  },
  {
    id: "2",
    name: "Mildred Peterson",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: "Lorem ipsum is simply dummy..",
    online: true,
    unreadCount: 1,
    email: "mildred.p@example.com",
    location: "London, UK",
    joined: "July 2020",
    bio: "Product manager by day, baker by night.",
    mutualGroups: ["Product Squad"],
    story: STORY_IMAGES[1],
  },
  {
    id: "3",
    name: "Patrick Gordon",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Lorem ipsum is simply dummy..",
    online: false,
    email: "patrick.g@example.com",
    location: "Toronto, Canada",
    joined: "January 2022",
    bio: "Full-stack developer & open source contributor.",
    mutualGroups: ["Engineering", "Hackathon 2023"],
    story: STORY_IMAGES[2],
  },
  {
    id: "4",
    name: "Jerry Lawson",
    avatar: "https://i.pravatar.cc/150?img=15",
    lastMessage: "Lorem ipsum is simply dummy..",
    online: true,
    isGroup: true,
    unreadCount: 7,
    email: "jerry.l@example.com",
    location: "Austin, TX",
    joined: "October 2019",
    bio: "Marketing wizard & podcast host.",
    mutualGroups: ["Marketing", "Friday Lunch"],
    story: STORY_IMAGES[3],
  },
  {
    id: "5",
    name: "Jordan Day",
    avatar: "https://i.pravatar.cc/150?img=8",
    lastMessage: "Lorem ipsum is simply dummy..",
    online: false,
    recent: true,
    email: "jordan.d@example.com",
    location: "Seattle, WA",
    joined: "May 2023",
    bio: "UX researcher & illustrator.",
    mutualGroups: ["Design Team"],
    story: STORY_IMAGES[4],
  },
  {
    id: "6",
    name: "Hannah Banks",
    avatar: "https://i.pravatar.cc/150?img=45",
    lastMessage: "Lorem ipsum is simply dummy..",
    online: true,
    recent: true,
    unreadCount: 2,
    email: "hannah.b@example.com",
    location: "Berlin, Germany",
    joined: "February 2022",
    bio: "Data scientist & yoga instructor.",
    mutualGroups: ["Data Crew", "Yoga Club"],
    story: STORY_IMAGES[5],
  },
  {
    id: "7",
    name: "Rachel Hoffman",
    avatar: "https://i.pravatar.cc/150?img=48",
    lastMessage: "Where does it come from?",
    online: true,
    email: "rachel.h@example.com",
    location: "San Francisco, CA",
    joined: "November 2020",
    bio: "Frontend engineer. React & animation geek.",
    mutualGroups: ["Engineering", "Design Team", "Hackathon 2023"],
    story: STORY_IMAGES[6],
  },
];
const initialMessages: Message[] = [
  {
    id: "m1",
    senderId: "7",
    text: "What is Lorem Ipsum dummy text?",
    time: "4:30 am",
  },
  {
    id: "m2",
    senderId: "me",
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown specimen book.",
    time: "4:35 am",
    status: "read",
    reactions: [
      {
        emoji: "❤️",
        count: 1,
        reactedByMe: false,
      },
    ],
    pinned: true,
    threadCount: 2,
    threadMessages: [
      {
        id: "m2-t1",
        senderId: "7",
        text: "Great explanation!",
        time: "4:36 am",
      },
      {
        id: "m2-t2",
        senderId: "me",
        text: "Thanks! Glad it helped.",
        time: "4:37 am",
        status: "read",
      },
    ],
  },
  {
    id: "m3",
    senderId: "7",
    text: "Where does it come from?",
    time: "4:40 am",
  },
  {
    id: "m4",
    senderId: "me",
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown specimen book.",
    time: "5:03 am",
    status: "read",
  },
  {
    id: "m5",
    senderId: "7",
    text: "Where does it come from?",
    time: "5:10 am",
  },
];
const contactMessages: Record<string, Message[]> = {
  "7": initialMessages,
  "1": [
    {
      id: "c1-m1",
      senderId: "1",
      text: "Hey! Saw your latest design work — absolutely stunning!",
      time: "10:15 am",
    },
    {
      id: "c1-m2",
      senderId: "me",
      text: "Thank you so much! Been working hard on it.",
      time: "10:17 am",
      status: "read",
    },
    {
      id: "c1-m3",
      senderId: "1",
      text: "Could we sync up this week to discuss the new project?",
      time: "10:20 am",
    },
  ],
  "2": [
    {
      id: "c2-m1",
      senderId: "2",
      text: "The product roadmap looks great. Just a few tweaks needed.",
      time: "9:00 am",
    },
    {
      id: "c2-m2",
      senderId: "me",
      text: "Sure, let me know what you need changed.",
      time: "9:05 am",
      status: "read",
    },
  ],
  "3": [
    {
      id: "c3-m1",
      senderId: "3",
      text: "Just pushed the new feature branch. Can you review?",
      time: "11:30 am",
    },
    {
      id: "c3-m2",
      senderId: "me",
      text: "On it! I'll check it out shortly.",
      time: "11:32 am",
      status: "sent",
    },
    {
      id: "c3-m3",
      senderId: "3",
      text: "Also fixed that nasty bug in the auth flow.",
      time: "11:35 am",
    },
  ],
  "4": [
    {
      id: "c4-m1",
      senderId: "4",
      text: "Campaign launch is next Monday. Are we all set?",
      time: "2:00 pm",
    },
    {
      id: "c4-m2",
      senderId: "me",
      text: "Yes, everything is ready on my end!",
      time: "2:03 pm",
      status: "read",
    },
  ],
  "5": [
    {
      id: "c5-m1",
      senderId: "5",
      text: "Finished the user research report. Sending it over!",
      time: "3:45 pm",
    },
    {
      id: "c5-m2",
      senderId: "me",
      text: "Perfect timing, thank you Jordan!",
      time: "3:47 pm",
      status: "delivered",
    },
  ],
  "6": [
    {
      id: "c6-m1",
      senderId: "6",
      text: "The data pipeline is running smoothly now 🎉",
      time: "8:30 am",
    },
    {
      id: "c6-m2",
      senderId: "me",
      text: "Great news! What was the issue in the end?",
      time: "8:33 am",
      status: "read",
    },
    {
      id: "c6-m3",
      senderId: "6",
      text: "A faulty transformation step. Fixed it this morning.",
      time: "8:35 am",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (d: Date) => {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
};
const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};
const getAttachmentIcon = (type: MessageAttachment["type"]) => {
  if (type === "image") return <ImageIcon className="w-4 h-4" />;
  if (type === "video") return <Film className="w-4 h-4" />;
  if (type === "audio" || type === "voice")
    return <Music className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

// ─── Glass Style Constants ────────────────────────────────────────────────────
const GLASS_CARD = "backdrop-blur-2xl bg-white/10 border border-white/20";

// ─── Layout Switcher ──────────────────────────────────────────────────────────
const LAYOUT_BUTTONS: {
  pos: LayoutPosition;
  Icon: React.ElementType;
  label: string;
}[] = [
  {
    pos: "left",
    Icon: PanelLeft,
    label: "Chat list left",
  },
  {
    pos: "right",
    Icon: PanelRight,
    label: "Chat list right",
  },
  {
    pos: "top",
    Icon: PanelTop,
    label: "Chat list top",
  },
  {
    pos: "bottom",
    Icon: PanelBottom,
    label: "Chat list bottom",
  },
];
const LayoutSwitcher = ({
  layout,
  onChange,
  isDark,
}: {
  layout: LayoutPosition;
  onChange: (pos: LayoutPosition) => void;
  isDark: boolean;
}) => (
  <div
    className="flex items-center gap-0.5 rounded-xl p-1"
    style={{
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
    }}
  >
    {LAYOUT_BUTTONS.map(({ pos, Icon, label }) => (
      <button
        key={pos}
        onClick={() => onChange(pos)}
        aria-label={label}
        title={label}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
        style={
          layout === pos
            ? {
                background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                color: "white",
                boxShadow: "0 0 10px rgba(255,255,255,0.25)",
              }
            : {
                background: "transparent",
                color: "rgba(255,255,255,0.5)",
              }
        }
      >
        <Icon className="w-4.5 h-4.5" />
      </button>
    ))}
  </div>
);

// ─── Chat List Panel ──────────────────────────────────────────────────────────
const ChatListPanel = ({
  layout,
  contacts: contactList,
  activeContactId,
  contactUnreads,
  searchQuery,
  onContactSwitch,
  onComposeOpen,
  onSearchChange,
  isDark,
}: {
  layout: LayoutPosition;
  contacts: Contact[];
  activeContactId: string;
  contactUnreads: Record<string, number>;
  searchQuery: string;
  onContactSwitch: (id: string) => void;
  onComposeOpen: () => void;
  onSearchChange: (v: string) => void;
  isDark: boolean;
}) => {
  const isHorizontal = layout === "top" || layout === "bottom";
  const filteredContacts = contactList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  if (isHorizontal) {
    return (
      <div
        className="flex-shrink-0 flex flex-col border-white/10 overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(135deg,rgba(76,29,149,0.55),rgba(124,58,237,0.4),rgba(6,182,212,0.25))"
            : "linear-gradient(135deg,rgba(237,233,254,0.65),rgba(243,244,246,0.65),rgba(207,250,254,0.65))",
          borderTop:
            layout === "bottom"
              ? isDark
                ? "1px solid rgba(167,139,250,0.2)"
                : "1px solid rgba(124,58,237,0.15)"
              : undefined,
          borderBottom:
            layout === "top"
              ? isDark
                ? "1px solid rgba(167,139,250,0.2)"
                : "1px solid rgba(124,58,237,0.15)"
              : undefined,
          backdropFilter: "blur(20px)",
          height: "80px",
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 h-full overflow-x-auto"
          style={{
            scrollbarWidth: "none",
          }}
        >
          <button
            onClick={onComposeOpen}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/20" : "hover:bg-black/5"}`}
            style={{
              background: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.03)",
              border: isDark
                ? "2px dashed rgba(255,255,255,0.25)"
                : "2px dashed rgba(0,0,0,0.15)",
            }}
          >
            <Plus className="w-4 h-4 text-white/50" />
          </button>
          <div
            className="w-px h-8 mx-1 flex-shrink-0"
            style={{
              background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
            }}
          />
          {filteredContacts.map((contact) => {
            const isActive = contact.id === activeContactId;
            const unread = contactUnreads[contact.id] || 0;
            return (
              <button
                key={contact.id}
                onClick={() => onContactSwitch(contact.id)}
                className={`relative flex-shrink-0 flex flex-col items-center gap-1 px-1 py-1 rounded-xl transition-all duration-200 ease-in-out group ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
              >
                <div
                  className={`relative rounded-full transition-all duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                  style={
                    isActive
                      ? {
                          filter: "drop-shadow(0 0 8px rgba(167,139,250,0.8))",
                        }
                      : {}
                  }
                >
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        margin: "-3px",
                        background:
                          "linear-gradient(135deg,#a78bfa,#f0abfc,#67e8f9)",
                        borderRadius: "50%",
                        padding: "2px",
                      }}
                    />
                  )}
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover"
                    style={
                      isActive
                        ? {
                            position: "relative",
                            zIndex: 1,
                            margin: "2px",
                          }
                        : {}
                    }
                  />
                  {contact.online && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-transparent rounded-full"
                      style={{
                        boxShadow: "0 0 6px rgba(74,222,128,0.8)",
                      }}
                    />
                  )}
                  {unread > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow-md"
                      style={{
                        background: "linear-gradient(135deg,#ef4444,#f97316)",
                      }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical layout (left / right)
  return (
    <motion.div
      key={`chat-list-${layout}`}
      initial={{
        opacity: 0,
        x: layout === "left" ? -20 : 20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="flex-shrink-0 flex flex-col overflow-hidden"
      style={{
        width: "280px",
        background: isDark ? "rgba(15,5,40,0.6)" : "rgba(255,255,255,0.7)",
        borderRight:
          layout === "left"
            ? isDark
              ? "1px solid rgba(167,139,250,0.15)"
              : "1px solid rgba(167,139,250,0.2)"
            : undefined,
        borderLeft:
          layout === "right"
            ? isDark
              ? "1px solid rgba(167,139,250,0.15)"
              : "1px solid rgba(167,139,250,0.2)"
            : undefined,
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Panel header */}
      <div
        className={`flex items-center justify-between px-4 py-3 flex-shrink-0 border-b ${isDark ? "border-white/8" : "border-black/5"}`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-white/70" : "text-gray-500"}`}
        >
          Chats
        </span>
        <button
          onClick={onComposeOpen}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/60 hover:bg-white/15 hover:text-white" : "text-gray-500 hover:bg-black/5 hover:text-gray-800"}`}
          style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          }}
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200"
          style={{
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.03)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Search
            className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-white/35" : "text-gray-400"}`}
          />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm ${isDark ? "placeholder-white/25 text-white" : "placeholder-gray-400 text-gray-800"}`}
          />
        </div>
      </div>
      {/* Contact list */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden py-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: isDark
            ? "rgba(167,139,250,0.2) transparent"
            : "rgba(124,58,237,0.2) transparent",
        }}
      >
        {filteredContacts.map((contact) => {
          const isActive = contact.id === activeContactId;
          const unread = contactUnreads[contact.id] || 0;
          return (
            <button
              key={contact.id}
              onClick={() => onContactSwitch(contact.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ease-in-out group"
              style={
                isActive
                  ? {
                      background: isDark
                        ? "linear-gradient(90deg,rgba(124,58,237,0.3),rgba(6,182,212,0.15))"
                        : "linear-gradient(90deg,rgba(124,58,237,0.15),rgba(6,182,212,0.08))",
                      borderLeft: isDark
                        ? "2px solid rgba(167,139,250,0.8)"
                        : "2px solid rgba(124,58,237,0.8)",
                      paddingLeft: "10px",
                    }
                  : {
                      borderLeft: "2px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";
                  (e.currentTarget as HTMLButtonElement).style.borderLeft =
                    isDark
                      ? "2px solid rgba(167,139,250,0.4)"
                      : "2px solid rgba(124,58,237,0.4)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateX(2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderLeft =
                    "2px solid transparent";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateX(0)";
                }
              }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-9 h-9 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                  style={{
                    border: isActive
                      ? isDark
                        ? "2px solid rgba(167,139,250,0.6)"
                        : "2px solid rgba(124,58,237,0.6)"
                      : isDark
                        ? "2px solid rgba(255,255,255,0.1)"
                        : "2px solid rgba(0,0,0,0.08)",
                  }}
                />
                {contact.online && (
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-transparent rounded-full"
                    style={{
                      boxShadow: "0 0 5px rgba(74,222,128,0.7)",
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-1">
                  <p
                    className={`text-sm font-semibold truncate transition-colors duration-200 ${isActive ? (isDark ? "text-white" : "text-gray-900") : isDark ? "text-white/75 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"}`}
                  >
                    {contact.name}
                  </p>
                  {unread > 0 && (
                    <span
                      className="min-w-[18px] h-[18px] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5 flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg,#ef4444,#f97316)",
                      }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs truncate mt-0.5 transition-colors duration-200 ${isDark ? "text-white/35 group-hover:text-white/50" : "text-gray-400 group-hover:text-gray-600"}`}
                >
                  {contact.lastMessage}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── Paper Shredder ───────────────────────────────────────────────────────────
const SHRED_STRIP_COUNT = 12;
const SHRED_ROTATIONS = Array.from(
  {
    length: SHRED_STRIP_COUNT,
  },
  (_, i) => (i % 2 === 0 ? 1 : -1) * (3 + ((i * 7) % 9)),
);
const SHRED_HEIGHTS = Array.from(
  {
    length: SHRED_STRIP_COUNT,
  },
  (_, i) => 32 + ((i * 13) % 24),
);
const PaperShredder = ({
  onComplete,
  isDark,
}: {
  onComplete: () => void;
  isDark: boolean;
}) => {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    const timer = setTimeout(() => onCompleteRef.current(), 1400);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full h-5 rounded-t-lg flex items-center justify-center gap-px bg-white/20">
        {Array.from(
          {
            length: SHRED_STRIP_COUNT,
          },
          (_, i) => (
            <div
              key={`tooth-${i}`}
              className="w-2 h-3 rounded-b-sm bg-white/30"
            />
          ),
        )}
      </div>
      <div
        className="flex items-start justify-center gap-px overflow-hidden"
        style={{
          height: "48px",
          width: "100%",
        }}
      >
        {Array.from(
          {
            length: SHRED_STRIP_COUNT,
          },
          (_, i) => (
            <motion.div
              key={`strip-${i}`}
              initial={{
                y: -48,
                scaleY: 0,
                opacity: 1,
              }}
              animate={{
                y: [0, 20, 60],
                scaleY: [0.2, 1, 0.6],
                opacity: [1, 1, 0],
                rotate: SHRED_ROTATIONS[i],
              }}
              transition={{
                duration: 0.9,
                delay: i * 0.05,
                ease: [0.4, 0, 0.6, 1],
              }}
              className="flex-1 rounded-b-sm bg-gradient-to-b from-violet-400/60 to-fuchsia-400/40"
              style={{
                height: `${SHRED_HEIGHTS[i]}px`,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
};

// ─── Story Viewer ─────────────────────────────────────────────────────────────
const StoryViewer = ({
  contact,
  onClose,
  hoursAgo,
}: {
  contact: Contact;
  onClose: () => void;
  hoursAgo: string;
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
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        initial={{
          scale: 0.92,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.92,
          opacity: 0,
        }}
        className="relative w-80 h-[540px] rounded-3xl overflow-hidden shadow-2xl"
      >
        <img
          src={contact.story || contact.avatar}
          alt={contact.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #a78bfa, #f0abfc, #67e8f9)",
            }}
          />
        </div>
        <div className="absolute top-8 left-4 right-4 flex items-center gap-2">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-white/60"
          />
          <span className="text-white font-semibold text-sm">
            {contact.name}
          </span>
          <span className="text-white/60 text-xs ml-1">{hoursAgo}</span>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:bg-white/30 hover:scale-110"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Schedule Picker ──────────────────────────────────────────────────────────
const SchedulePicker = ({
  options,
  title,
  onSchedule,
  onClose,
  isDark,
}: {
  options: {
    label: string;
    offset: number;
  }[];
  title: string;
  onSchedule: (label: string, offset: number) => void;
  onClose: () => void;
  isDark: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 10,
        scale: 0.96,
      }}
      transition={{
        duration: 0.16,
      }}
      className={`absolute bottom-full right-0 mb-3 w-56 rounded-2xl shadow-2xl overflow-hidden z-40 ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "bg-white border border-black/8 shadow-xl"}`}
      style={{
        boxShadow: isDark
          ? "0 8px 40px rgba(139,92,246,0.3)"
          : "0 8px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <Clock3
          className={`w-4 h-4 ${isDark ? "text-violet-300" : "text-violet-650"}`}
        />
        <span
          className={`text-xs font-semibold ${isDark ? "text-white/90" : "text-gray-800"}`}
        >
          {title}
        </span>
      </div>
      <div className="py-1">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => {
              onSchedule(opt.label, opt.offset);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-all duration-200 ease-in-out ${isDark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-black/5 hover:text-gray-900"}`}
          >
            <Clock3
              className={`w-3.5 h-3.5 ${isDark ? "text-violet-300" : "text-violet-605"}`}
            />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
const EmojiPicker = ({
  categories,
  onSelect,
  onClose,
  isDark,
}: {
  categories: EmojiCategory[];
  onSelect: (e: string) => void;
  onClose: () => void;
  isDark: boolean;
}) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: 12,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 12,
        scale: 0.96,
      }}
      transition={{
        duration: 0.18,
      }}
      className={`absolute bottom-full left-0 mb-3 w-80 rounded-2xl shadow-2xl overflow-hidden z-40 ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "backdrop-blur-2xl bg-white/80 border border-white/30"}`}
      style={{
        boxShadow: isDark
          ? "0 8px 40px rgba(139,92,246,0.3)"
          : "0 8px 40px rgba(124,58,237,0.08)",
      }}
    >
      <div
        className={`flex px-2 pt-2 gap-1 border-b ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        {categories.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(i)}
            className={`flex-1 text-[10px] font-medium pb-2 border-b-2 transition-all duration-200 ease-in-out ${activeCategory === i ? (isDark ? "border-violet-400 text-violet-300" : "border-violet-600 text-violet-600") : isDark ? "border-transparent text-white/40 hover:text-white/70" : "border-transparent text-gray-400 hover:text-gray-650"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="p-3 grid grid-cols-8 gap-1 max-h-52 overflow-y-auto">
        {categories[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className={`w-8 h-8 flex items-center justify-center text-xl rounded-lg transition-all duration-150 ease-in-out hover:scale-125 ${isDark ? "hover:bg-white/15" : "hover:bg-black/5"}`}
          >
            <span>{emoji}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Reaction Picker ──────────────────────────────────────────────────────────
const ReactionPicker = ({
  onSelect,
  isMe,
  isDark,
}: {
  onSelect: (emoji: string) => void;
  isMe: boolean;
  isDark: boolean;
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 6,
      scale: 0.9,
    }}
    animate={{
      opacity: 1,
      y: 0,
      scale: 1,
    }}
    exit={{
      opacity: 0,
      y: 6,
      scale: 0.9,
    }}
    transition={{
      duration: 0.15,
    }}
    className={`absolute -top-10 ${isMe ? "right-0" : "left-0"} flex items-center gap-0.5 rounded-full px-2 py-1 z-30 ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "backdrop-blur-2xl bg-white/80 border border-white/30"}`}
    style={{
      boxShadow: isDark
        ? "0 4px 20px rgba(139,92,246,0.4)"
        : "0 4px 20px rgba(124,58,237,0.08)",
    }}
  >
    {QUICK_REACTIONS.map((emoji) => (
      <button
        key={emoji}
        onClick={() => onSelect(emoji)}
        className={`w-8 h-8 flex items-center justify-center text-lg rounded-full transition-all duration-150 ease-in-out hover:scale-125 ${isDark ? "hover:bg-white/20" : "hover:bg-black/5"}`}
      >
        <span>{emoji}</span>
      </button>
    ))}
  </motion.div>
);

// ─── Message Action Menu ──────────────────────────────────────────────────────
const MessageActionMenu = ({
  isMe,
  onReply,
  onForward,
  onDelete,
  onThread,
  onPin,
  pinLabel,
  onClose,
  isDark,
}: {
  isMe: boolean;
  onReply: () => void;
  onForward: () => void;
  onDelete: () => void;
  onThread: () => void;
  onPin: () => void;
  pinLabel: string;
  onClose: () => void;
  isDark: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  const actions = [
    {
      icon: <CornerUpLeft className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-indigo-400 group-hover:text-indigo-300" : "text-indigo-500 group-hover:text-indigo-600"}`} strokeWidth={1.8} />,
      label: "Reply",
      fn: onReply,
      danger: false,
    },
    {
      icon: <Forward className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-sky-400 group-hover:text-sky-300" : "text-sky-500 group-hover:text-sky-600"}`} strokeWidth={1.8} />,
      label: "Forward",
      fn: onForward,
      danger: false,
    },
    {
      icon: <MessageSquare className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-emerald-400 group-hover:text-emerald-300" : "text-emerald-500 group-hover:text-emerald-600"}`} strokeWidth={1.8} />,
      label: "Thread",
      fn: onThread,
      danger: false,
    },
    {
      icon: <Pin className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-amber-400 group-hover:text-amber-300" : "text-amber-500 group-hover:text-amber-600"}`} strokeWidth={1.8} />,
      label: pinLabel,
      fn: onPin,
      danger: false,
    },
    {
      icon: <Trash2 className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-red-400 group-hover:text-red-300" : "text-red-500 group-hover:text-red-600"}`} strokeWidth={1.8} />,
      label: "Delete",
      fn: onDelete,
      danger: true,
    },
  ];
  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        scale: 0.88,
        y: 4,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.88,
        y: 4,
      }}
      transition={{
        duration: 0.14,
      }}
      className={`absolute top-8 ${isMe ? "left-0" : "right-0"} rounded-2xl shadow-2xl py-1.5 min-w-[130px] z-40 ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "backdrop-blur-2xl bg-white/85 border border-white/30"}`}
      style={{
        boxShadow: isDark
          ? "0 8px 30px rgba(139,92,246,0.35)"
          : "0 8px 30px rgba(124,58,237,0.08)",
      }}
    >
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => {
            a.fn();
            onClose();
          }}
          className={`group w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-all duration-200 ease-in-out ${a.danger ? (isDark ? "text-red-400 hover:bg-red-500/20" : "text-red-600 hover:bg-red-500/10") : isDark ? "text-white/80 hover:bg-white/15" : "text-gray-700 hover:bg-black/5 hover:text-gray-900"}`}
        >
          {a.icon}
          <span>{a.label}</span>
        </button>
      ))}
    </motion.div>
  );
};

// ─── Attachment Preview Bar ───────────────────────────────────────────────────
const AttachmentPreviewBar = ({
  files,
  onRemove,
  onSend,
  isDark,
  countLabel,
  sendAllLabel,
}: {
  files: PendingFile[];
  onRemove: (name: string) => void;
  onSend: () => void;
  isDark: boolean;
  countLabel: string;
  sendAllLabel: string;
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 10,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      y: 10,
    }}
    className={`px-6 py-3 border-t backdrop-blur-md ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/5"}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <span
        className={`text-xs font-semibold ${isDark ? "text-white/70" : "text-gray-655"}`}
      >
        <span>{countLabel}</span>
      </span>
      <button
        onClick={onSend}
        className="ml-auto text-xs font-semibold text-white px-3 py-1 rounded-full transition-all duration-200 ease-in-out hover:scale-105 hover:brightness-110"
        style={{
          background: "linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4)",
        }}
      >
        {sendAllLabel}
      </button>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {files.map((f) => (
        <div
          key={f.name}
          className="relative flex-shrink-0 group cursor-pointer"
        >
          {f.type === "image" && f.preview ? (
            <div
              className={`w-20 h-20 rounded-xl overflow-hidden border ${isDark ? "border-white/20" : "border-black/10"}`}
            >
              <img
                src={f.preview}
                alt={f.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`w-20 h-20 rounded-xl border flex flex-col items-center justify-center gap-1 px-1 ${isDark ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5"}`}
            >
              <div className="text-violet-300">{getAttachmentIcon(f.type)}</div>
              <p
                className={`text-[9px] text-center leading-tight break-all line-clamp-2 ${isDark ? "text-white/50" : "text-gray-500"}`}
              >
                {f.name}
              </p>
              <p
                className={`text-[9px] ${isDark ? "text-white/35" : "text-gray-400"}`}
              >
                {f.size}
              </p>
            </div>
          )}
          <button
            onClick={() => onRemove(f.name)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow hover:scale-110"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  </motion.div>
);

// ─── Voice Recorder ───────────────────────────────────────────────────────────
const VoiceRecorder = ({
  onSend,
  onCancel,
  isDark,
}: {
  onSend: (duration: number) => void;
  onCancel: () => void;
  isDark: boolean;
}) => {
  const [seconds, setSeconds] = useState(0);
  const [waveHeights] = useState(() =>
    Array.from(
      {
        length: 24,
      },
      () => Math.random() * 0.7 + 0.3,
    ),
  );
  useEffect(() => {
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 8,
      }}
      className={`flex items-center gap-3 rounded-full px-4 py-2 flex-1 border ${isDark ? "border-red-400/40 bg-red-500/10" : "border-red-400/30 bg-red-500/5"}`}
    >
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
        className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0"
      />
      <div className="flex items-center gap-0.5 flex-1">
        {waveHeights.map((h, i) => (
          <motion.div
            key={`wave-${i}`}
            animate={{
              scaleY: [h, h * 0.4, h],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.04,
            }}
            className="w-1 bg-red-400/70 rounded-full flex-shrink-0"
            style={{
              height: "20px",
              transformOrigin: "center",
            }}
          />
        ))}
      </div>
      <span
        className={`text-xs font-semibold flex-shrink-0 ${isDark ? "text-red-300" : "text-red-600"}`}
      >
        {formatDuration(seconds)}
      </span>
      <button
        onClick={onCancel}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 ${isDark ? "bg-white/15 hover:bg-white/25 text-white/70" : "bg-black/5 hover:bg-black/8 text-gray-655"}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onSend(seconds)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0"
        style={{
          background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
        }}
      >
        <Send className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

// ─── AI Panel ─────────────────────────────────────────────────────────────────
const AIPanel = ({
  onSelect,
  onClose,
  lastMessage,
  isDark,
  title,
  loadingText,
}: {
  onSelect: (text: string) => void;
  onClose: () => void;
  lastMessage: string;
  isDark: boolean;
  title: string;
  loadingText: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const shuffled = [...AI_SUGGESTIONS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setSuggestions(shuffled);
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [lastMessage]);
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 10,
      }}
      className="mx-6 mb-2 rounded-2xl p-4"
      style={{
        background: isDark
          ? "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.15),rgba(6,182,212,0.15))"
          : "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08),rgba(6,182,212,0.08))",
        border: isDark
          ? "1px solid rgba(167,139,250,0.3)"
          : "1px solid rgba(124,58,237,0.25)",
        boxShadow: isDark
          ? "0 4px 24px rgba(139,92,246,0.2)"
          : "0 4px 24px rgba(124,58,237,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span
            className={`text-xs font-semibold ${isDark ? "text-violet-300" : "text-violet-700"}`}
          >
            {title}
          </span>
        </div>
        <button
          onClick={onClose}
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/40 hover:bg-white/15 hover:text-white" : "text-gray-400 hover:bg-black/5 hover:text-gray-600"}`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="w-4 h-4 text-violet-300 animate-spin" />
          <span
            className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}
          >
            {loadingText}
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <button
              key={`ai-${i}`}
              onClick={() => {
                onSelect(s);
                onClose();
              }}
              className={`w-full text-left text-xs rounded-xl px-3 py-2 transition-all duration-200 ease-in-out leading-relaxed ${isDark ? "text-white/80 hover:bg-white/15 hover:text-white border border-white/10 hover:border-violet-400/40" : "text-gray-700 hover:bg-black/5 hover:text-gray-900 border border-black/5 hover:border-violet-500/30"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── Reply Bar ────────────────────────────────────────────────────────────────
const ReplyBar = ({
  reply,
  onCancel,
  isDark,
}: {
  reply: ReplyPreview;
  onCancel: () => void;
  isDark: boolean;
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 6,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      y: 6,
    }}
    className={`mx-6 mb-2 flex items-center gap-3 border-l-4 rounded-r-xl px-3 py-2 ${isDark ? "bg-violet-500/15 border-violet-400" : "bg-violet-500/8 border-violet-500"}`}
  >
    <CornerUpLeft
      className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-violet-300" : "text-violet-650"}`}
    />
    <div className="flex-1 min-w-0">
      <p
        className={`text-[10px] font-semibold ${isDark ? "text-violet-300" : "text-violet-600"}`}
      >
        {reply.senderName}
      </p>
      <p
        className={`text-xs truncate ${isDark ? "text-white/60" : "text-gray-600"}`}
      >
        {reply.text}
      </p>
    </div>
    <button
      onClick={onCancel}
      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/40" : "hover:bg-black/5 text-gray-500"}`}
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);

// ─── Message Search Bar ───────────────────────────────────────────────────────
const MessageSearchBar = ({
  query,
  onChange,
  onClose,
  matchCount,
  currentMatch,
  onPrev,
  onNext,
  isDark,
  placeholder,
}: {
  query: string;
  onChange: (v: string) => void;
  onClose: () => void;
  matchCount: number;
  currentMatch: number;
  onPrev: () => void;
  onNext: () => void;
  isDark: boolean;
  placeholder: string;
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: -10,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      y: -10,
    }}
    transition={{
      duration: 0.2,
    }}
    className={`flex items-center gap-2 px-6 py-2.5 border-b backdrop-blur-md ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-white/40"}`}
  >
    <SearchIcon
      className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`}
    />
    <input
      autoFocus
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={(e) => onChange(e.target.value)}
      className={`flex-1 bg-transparent outline-none text-sm ${isDark ? "placeholder-white/30 text-white" : "placeholder-gray-400 text-gray-800"}`}
    />
    {query && (
      <span
        className={`text-xs font-medium flex-shrink-0 ${isDark ? "text-white/50" : "text-gray-500"}`}
      >
        {matchCount > 0 ? `${currentMatch + 1} / ${matchCount}` : "0"}
      </span>
    )}
    <button
      onClick={onPrev}
      disabled={matchCount === 0}
      className={`w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30 transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/60" : "hover:bg-black/5 text-gray-500 hover:text-gray-700"}`}
    >
      <ChevronUp className="w-3.5 h-3.5" />
    </button>
    <button
      onClick={onNext}
      disabled={matchCount === 0}
      className={`w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30 transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/60" : "hover:bg-black/5 text-gray-500 hover:text-gray-700"}`}
    >
      <ChevronDown className="w-3.5 h-3.5" />
    </button>
    <button
      onClick={onClose}
      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/60" : "hover:bg-black/5 text-gray-500 hover:text-gray-700"}`}
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);

// ─── Pinned Banner ────────────────────────────────────────────────────────────
const PinnedBanner = ({
  message,
  onDismiss,
  onJump,
  isDark,
  label,
}: {
  message: Message;
  onDismiss: () => void;
  onJump: () => void;
  isDark: boolean;
  label: string;
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: -8,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      y: -8,
    }}
    transition={{
      duration: 0.2,
    }}
    className={`mx-6 mt-3 mb-0 flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer group transition-all duration-200 ease-in-out ${isDark ? "hover:bg-violet-500/20" : "hover:bg-violet-500/10"}`}
    style={{
      background: isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)",
      border: isDark
        ? "1px solid rgba(167,139,250,0.25)"
        : "1px solid rgba(124,58,237,0.2)",
    }}
    onClick={onJump}
  >
    <div
      className="w-0.5 h-8 rounded-full flex-shrink-0"
      style={{
        background: "linear-gradient(180deg,#a78bfa,#67e8f9)",
      }}
    />
    <Pin
      className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-violet-300" : "text-violet-600"}`}
    />
    <div className="flex-1 min-w-0">
      <p
        className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-violet-300" : "text-violet-600"}`}
      >
        {label}
      </p>
      <p
        className={`text-xs truncate ${isDark ? "text-white/60" : "text-gray-600"}`}
      >
        {message.text}
      </p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDismiss();
      }}
      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out ${isDark ? "hover:bg-white/15 text-white/40" : "hover:bg-black/5 text-gray-500"}`}
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);

// ─── Voice Bubble ─────────────────────────────────────────────────────────────
const VoiceBubble = ({
  duration,
  isMe,
  isDark,
}: {
  duration: number;
  isMe: boolean;
  isDark: boolean;
}) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const bars = Array.from(
    {
      length: 20,
    },
    (_, i) => 0.3 + Math.sin(i * 0.8) * 0.4 + Math.random() * 0.3,
  );
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(
      () =>
        setProgress((p) => {
          if (p >= 100) {
            setPlaying(false);
            return 0;
          }
          return p + 100 / (duration * 10);
        }),
      100,
    );
    return () => clearInterval(iv);
  }, [playing, duration]);
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl min-w-[160px] transition-all duration-200 ease-in-out hover:brightness-110 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}
      style={{
        background: isMe
          ? "linear-gradient(135deg,rgba(124,58,237,0.5),rgba(168,85,247,0.4),rgba(6,182,212,0.35))"
          : isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.85)",
        border: isMe
          ? "1px solid rgba(167,139,250,0.4)"
          : isDark
            ? "1px solid rgba(255,255,255,0.15)"
            : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <button
        onClick={() => setPlaying((p) => !p)}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ease-in-out hover:scale-110 ${isDark || isMe ? "text-white" : "text-gray-500 hover:text-gray-800"}`}
        style={{
          background: isMe
            ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
            : isDark
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.05)",
        }}
      >
        {playing ? (
          <Square className="w-3 h-3 fill-current" />
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex items-center gap-0.5 flex-1">
        {bars.map((h, i) => (
          <div
            key={`vb-${i}`}
            className="w-1 rounded-full flex-shrink-0 transition-all"
            style={{
              height: `${h * 20}px`,
              background:
                i < Math.floor((bars.length * progress) / 100)
                  ? "linear-gradient(180deg,#a78bfa,#67e8f9)"
                  : isDark || isMe
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>
      <span
        className={`text-[10px] flex-shrink-0 ${isDark || isMe ? "text-white/50" : "text-gray-400"}`}
      >
        {formatDuration(duration)}
      </span>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({
  msgText,
  isMe,
  onDeleteForMe,
  onDeleteForEveryone,
  onCancel,
  isDark,
  title,
  subtitle,
  deleteForMeLabel,
  deleteForMeDesc,
  deleteForEveryoneLabel,
  deleteForEveryoneDesc,
  cancelLabel,
  deletingForMeLabel,
  deletingForEveryoneLabel,
}: {
  msgText: string;
  isMe: boolean;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onCancel: () => void;
  isDark: boolean;
  title: string;
  subtitle: string;
  deleteForMeLabel: string;
  deleteForMeDesc: string;
  deleteForEveryoneLabel: string;
  deleteForEveryoneDesc: string;
  cancelLabel: string;
  deletingForMeLabel: string;
  deletingForEveryoneLabel: string;
}) => {
  const [phase, setPhase] = useState<"choice" | "shredding">("choice");
  const [deleteMode, setDeleteMode] = useState<"me" | "everyone" | null>(null);
  const handleDelete = (mode: "me" | "everyone") => {
    setDeleteMode(mode);
    setPhase("shredding");
  };
  const handleShredComplete = () => {
    if (deleteMode === "me") onDeleteForMe();
    else if (deleteMode === "everyone") onDeleteForEveryone();
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
        backdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        initial={{
          scale: 0.88,
          opacity: 0,
          y: 24,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
        }}
        exit={{
          scale: 0.88,
          opacity: 0,
          y: 24,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 28,
        }}
        className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "backdrop-blur-2xl bg-white/80 border border-white/30"}`}
        style={{
          boxShadow: isDark
            ? "0 20px 60px rgba(139,92,246,0.4)"
            : "0 20px 60px rgba(139,92,246,0.1)",
        }}
      >
        <div
          className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? "border-white/10" : "border-black/5"}`}
        >
          <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h3>
            <p
              className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {subtitle}
            </p>
          </div>
          {phase === "choice" && (
            <button
              onClick={onCancel}
              className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="px-5 py-5 space-y-4">
          {phase === "choice" && (
            <div
              className={`rounded-xl px-4 py-3 border ${isDark ? "bg-white/8 border-white/10" : "bg-black/5 border-black/10"}`}
            >
              <p
                className={`text-xs leading-relaxed line-clamp-3 ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                {msgText || "Voice message"}
              </p>
            </div>
          )}
          {phase === "shredding" && (
            <div
              className={`rounded-xl px-4 py-3 border ${isDark ? "bg-white/8 border-white/10" : "bg-black/5 border-black/10"}`}
            >
              <PaperShredder onComplete={handleShredComplete} isDark={isDark} />
            </div>
          )}
          {phase === "shredding" && (
            <div
              className={`flex items-center justify-center gap-2 ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent"
              />
              <span className="text-xs font-medium">
                {deleteMode === "everyone"
                  ? deletingForEveryoneLabel
                  : deletingForMeLabel}
              </span>
            </div>
          )}
          {phase === "choice" && (
            <div className="space-y-2">
              <button
                onClick={() => handleDelete("me")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out border ${isDark ? "bg-white/8 hover:bg-white/15 text-white/80 border-white/10 hover:border-white/20" : "bg-black/5 hover:bg-black/8 text-gray-700 border-black/10 hover:border-black/15"}`}
              >
                <MessageCircleOff className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{deleteForMeLabel}</p>
                  <p
                    className={`text-xs font-normal ${isDark ? "text-white/40" : "text-gray-400"}`}
                  >
                    {deleteForMeDesc}
                  </p>
                </div>
              </button>
              {isMe && (
                <button
                  onClick={() => handleDelete("everyone")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-red-500/15 hover:bg-red-500/25 text-red-600 transition-all duration-200 ease-in-out border border-red-500/30"
                >
                  <Trash className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold">{deleteForEveryoneLabel}</p>
                    <p className="text-xs font-normal text-red-500/70">
                      {deleteForEveryoneDesc}
                    </p>
                  </div>
                </button>
              )}
              <button
                onClick={onCancel}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${isDark ? "text-white/40 hover:bg-white/8" : "text-gray-500 hover:bg-black/5"}`}
              >
                {cancelLabel}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Delete Conversation Modal ────────────────────────────────────────────────
const DeleteConversationModal = ({
  contactName,
  onConfirm,
  onCancel,
  isDark,
  title,
  descPrefix,
  deleteAllLabel,
  cancelLabel,
  shreddingLabel,
}: {
  contactName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDark: boolean;
  title: string;
  descPrefix: string;
  deleteAllLabel: string;
  cancelLabel: string;
  shreddingLabel: string;
}) => {
  const [shredding, setShredding] = useState(false);
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
        backdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        initial={{
          scale: 0.88,
          opacity: 0,
          y: 24,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
        }}
        exit={{
          scale: 0.88,
          opacity: 0,
          y: 24,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 28,
        }}
        className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "backdrop-blur-2xl bg-white/80 border border-white/30"}`}
        style={{
          boxShadow: isDark
            ? "0 20px 60px rgba(139,92,246,0.4)"
            : "0 20px 60px rgba(139,92,246,0.1)",
        }}
      >
        <div
          className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? "border-white/10" : "border-black/5"}`}
        >
          <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center">
            <Trash className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h3>
            <p
              className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {contactName}
            </p>
          </div>
          <button
            onClick={onCancel}
            className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          {shredding ? (
            <div className="space-y-3">
              <div
                className="flex gap-0.5 overflow-hidden rounded-xl"
                style={{
                  height: "64px",
                }}
              >
                {Array.from(
                  {
                    length: 16,
                  },
                  (_, i) => (
                    <motion.div
                      key={`cs-${i}`}
                      initial={{
                        y: 0,
                      }}
                      animate={{
                        y: 80,
                        rotate: (i % 2 === 0 ? 1 : -1) * ((i * 3 + 5) % 15),
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.03,
                        ease: [0.36, 0, 0.66, -0.56],
                      }}
                      className="flex-1 rounded-b-sm bg-gradient-to-b from-violet-500/40 to-fuchsia-500/30"
                    />
                  ),
                )}
              </div>
              <div className="flex items-center justify-center gap-2 py-2">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent"
                  onAnimationStart={() =>
                    setTimeout(() => onConfirmRef.current(), 900)
                  }
                />
                <span
                  className={`text-xs font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}
                >
                  {shreddingLabel}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p
                className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                {descPrefix}{" "}
                <strong className={isDark ? "text-white" : "text-gray-900"}>
                  {contactName}
                </strong>
                .
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onCancel}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${isDark ? "bg-white/10 text-white/70 hover:bg-white/15" : "bg-black/5 text-gray-600 hover:bg-black/8"}`}
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => setShredding(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200 ease-in-out"
                >
                  {deleteAllLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Incoming Call Screen ─────────────────────────────────────────────────────
const IncomingCallScreen = ({
  contact,
  callType,
  onAccept,
  onDecline,
  declineLabel,
  acceptLabel,
  incomingVideoLabel,
  incomingVoiceLabel,
}: {
  contact: Contact;
  callType: "audio" | "video";
  onAccept: () => void;
  onDecline: () => void;
  declineLabel: string;
  acceptLabel: string;
  incomingVideoLabel: string;
  incomingVoiceLabel: string;
}) => (
  <motion.div
    initial={{
      opacity: 0,
    }}
    animate={{
      opacity: 1,
    }}
    exit={{
      opacity: 0,
    }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(24px)",
    }}
  >
    <motion.div
      initial={{
        scale: 0.85,
        opacity: 0,
        y: 30,
      }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
      }}
      exit={{
        scale: 0.85,
        opacity: 0,
        y: 30,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
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
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.94,
            }}
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out"
          >
            <PhoneMissed className="w-7 h-7" />
          </motion.button>
          <span className="text-white/60 text-xs">{declineLabel}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.94,
            }}
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

// ─── Contact Info Drawer ──────────────────────────────────────────────────────
const ContactInfoDrawer = ({
  contact,
  onClose,
  onDeleteConversation,
  isDark,
  t,
}: {
  contact: Contact;
  onClose: () => void;
  onDeleteConversation: () => void;
  isDark: boolean;
  t: Translations;
}) => {
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("info");
  const sharedFiles = [
    {
      name: "Project_Brief.pdf",
      size: "2.4 MB",
      type: "file" as const,
    },
    {
      name: "Design_Assets.zip",
      size: "18.7 MB",
      type: "file" as const,
    },
    {
      name: "Meeting_Notes.docx",
      size: "340 KB",
      type: "file" as const,
    },
  ];
  const quickActions = [
    {
      icon: <Phone className="w-4 h-4" />,
      label: t.call,
    },
    {
      icon: <Video className="w-4 h-4" />,
      label: t.video,
    },
    {
      icon: <Bell className="w-4 h-4" />,
      label: t.mute,
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: t.star,
    },
  ];
  return (
    <motion.div
      initial={{
        x: "100%",
        opacity: 0,
      }}
      animate={{
        x: 0,
        opacity: 1,
      }}
      exit={{
        x: "100%",
        opacity: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`w-72 flex-shrink-0 border-l flex flex-col overflow-hidden ${isDark ? "border-white/10" : "border-black/5"}`}
      style={{
        background: isDark ? "rgba(15,5,40,0.65)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div
        className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <h3
          className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {t.contactInfo}
        </h3>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div
        className={`flex border-b flex-shrink-0 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <button
          onClick={() => setDrawerTab("info")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out border-b-2 ${drawerTab === "info" ? (isDark ? "border-violet-400 text-violet-300" : "border-violet-600 text-violet-600") : isDark ? "border-transparent text-white/40 hover:text-white/70" : "border-transparent text-gray-400 hover:text-gray-650"}`}
        >
          {t.info}
        </button>
        <button
          onClick={() => setDrawerTab("media")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out border-b-2 flex items-center justify-center gap-1.5 ${drawerTab === "media" ? (isDark ? "border-violet-400 text-violet-300" : "border-violet-600 text-violet-600") : isDark ? "border-transparent text-white/40 hover:text-white/70" : "border-transparent text-gray-400 hover:text-gray-650"}`}
        >
          <Grid3X3 className="w-3 h-3" />
          <span>{t.media}</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {drawerTab === "info" && (
          <div>
            <div
              className="flex flex-col items-center px-5 pt-6 pb-4"
              style={{
                background: isDark
                  ? "linear-gradient(180deg,rgba(124,58,237,0.2),transparent)"
                  : "linear-gradient(180deg,rgba(124,58,237,0.06),transparent)",
              }}
            >
              <div className="relative mb-3">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-20 h-20 rounded-full object-cover border-4 shadow-md"
                  style={{
                    borderColor: "rgba(167,139,250,0.5)",
                  }}
                />
                {contact.online && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white/20 rounded-full" />
                )}
              </div>
              <h2
                className={`font-bold text-lg leading-tight text-center ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {contact.name}
              </h2>
              <p
                className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}
              >
                {contact.online ? t.online : "Offline"}
              </p>
              {contact.bio && (
                <p
                  className={`text-xs text-center mt-2 leading-relaxed px-2 ${isDark ? "text-white/50" : "text-gray-500"}`}
                >
                  {contact.bio}
                </p>
              )}
              <div className="flex gap-3 mt-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out group-hover:scale-110 ${isDark ? "text-violet-300 group-hover:text-white" : "text-violet-600 group-hover:text-violet-850"}`}
                      style={{
                        background: isDark
                          ? "rgba(124,58,237,0.2)"
                          : "rgba(124,58,237,0.08)",
                        border: isDark
                          ? "1px solid rgba(167,139,250,0.25)"
                          : "1px solid rgba(124,58,237,0.2)",
                      }}
                    >
                      {action.icon}
                    </div>
                    <span
                      className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}
                    >
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8 text-white/40" : "bg-black/5 text-gray-400"}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-[10px] uppercase tracking-wider ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      {t.email}
                    </p>
                    <p
                      className={`text-xs font-medium truncate ${isDark ? "text-white/75" : "text-gray-700"}`}
                    >
                      {contact.email}
                    </p>
                  </div>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8 text-white/40" : "bg-black/5 text-gray-400"}`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p
                      className={`text-[10px] uppercase tracking-wider ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      {t.location}
                    </p>
                    <p
                      className={`text-xs font-medium ${isDark ? "text-white/75" : "text-gray-700"}`}
                    >
                      {contact.location}
                    </p>
                  </div>
                </div>
              )}
              {contact.joined && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8 text-white/40" : "bg-black/5 text-gray-400"}`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p
                      className={`text-[10px] uppercase tracking-wider ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      {t.memberSince}
                    </p>
                    <p
                      className={`text-xs font-medium ${isDark ? "text-white/75" : "text-gray-700"}`}
                    >
                      {contact.joined}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div
              className={`mx-5 border-t my-1 ${isDark ? "border-white/10" : "border-black/5"}`}
            />
            {contact.mutualGroups && contact.mutualGroups.length > 0 && (
              <div className="px-5 py-3">
                <p
                  className={`text-[10px] uppercase tracking-wider mb-2 ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  {t.mutualGroups}
                </p>
                <div className="space-y-1">
                  {contact.mutualGroups.map((group) => (
                    <button
                      key={group}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ease-in-out group ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-violet-300 bg-violet-500/20">
                          <Search className="w-3 h-3" />
                        </div>
                        <span
                          className={`text-xs font-medium ${isDark ? "text-white/70" : "text-gray-655"}`}
                        >
                          {group}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-white/25 group-hover:text-white/50" : "text-gray-400 group-hover:text-violet-650"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div
              className={`mx-5 border-t my-1 ${isDark ? "border-white/10" : "border-black/5"}`}
            />
            <div className="px-5 py-3 space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ease-in-out ${isDark ? "hover:bg-white/8 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
              >
                <Shield
                  className={`w-4 h-4 ${isDark ? "text-white/35" : "text-gray-400"}`}
                />
                <span className="text-xs">{t.blockContact}</span>
              </button>
              <button
                onClick={onDeleteConversation}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/15 text-red-400 transition-all duration-200 ease-in-out"
              >
                <Trash className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {t.deleteConversation}
                </span>
              </button>
            </div>
          </div>
        )}
        {drawerTab === "media" && (
          <div className="p-4">
            <p
              className={`text-[10px] uppercase tracking-wider mb-3 ${isDark ? "text-white/35" : "text-gray-400"}`}
            >
              {t.sharedMedia} · {SAMPLE_MEDIA_IMAGES.length}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {SAMPLE_MEDIA_IMAGES.map((src, idx) => (
                <div
                  key={`media-${idx}`}
                  className={`aspect-square rounded-xl overflow-hidden group cursor-pointer border ${isDark ? "bg-white/10 border-white/10 ring-1 ring-white/10" : "bg-black/5 border-black/5"}`}
                >
                  <img
                    src={src}
                    alt={`Shared media ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                  />
                </div>
              ))}
            </div>
            <div
              className={`mt-4 border-t pt-4 ${isDark ? "border-white/10" : "border-black/5"}`}
            >
              <p
                className={`text-[10px] uppercase tracking-wider mb-3 ${isDark ? "text-white/35" : "text-gray-400"}`}
              >
                {t.sharedFiles} · 3
              </p>
              {sharedFiles.map((file) => (
                <div
                  key={file.name}
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all duration-200 ease-in-out cursor-pointer group ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${isDark ? "text-violet-300 bg-violet-500/20 group-hover:bg-violet-500/35" : "text-violet-650 bg-violet-500/10 group-hover:bg-violet-500/25"}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${isDark ? "text-white/70" : "text-gray-700"}`}
                    >
                      {file.name}
                    </p>
                    <p
                      className={`text-[10px] ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      {file.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Compose Modal ────────────────────────────────────────────────────────────
const ComposeModal = ({
  onClose,
  onSelectContact,
  isDark,
  title,
  searchPlaceholder,
  noResultsLabel,
  groupBadge,
}: {
  onClose: () => void;
  onSelectContact: (id: string) => void;
  isDark: boolean;
  title: string;
  searchPlaceholder: string;
  noResultsLabel: string;
  groupBadge: string;
}) => {
  const [composeSearch, setComposeSearch] = useState("");
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(composeSearch.toLowerCase()),
  );
  return (
    <motion.div
      onClick={onClose}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.25)",
        backdropFilter: "blur(20px)",
      }}
    >
      <style>{`
      .compose-modal-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .compose-modal-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .compose-modal-scroll::-webkit-scrollbar-thumb {
        background: ${isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"};
        border-radius: 9999px;
      }
      .compose-modal-scroll::-webkit-scrollbar-thumb:hover {
        background: ${isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
      }
      .compose-modal-scroll {
        scrollbar-width: thin;
        scrollbar-color: ${isDark ? "rgba(255, 255, 255, 0.15) transparent" : "rgba(0, 0, 0, 0.15) transparent"};
      }
    `}</style>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{
          scale: 0.9,
          opacity: 0,
          y: 20,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
        }}
        exit={{
          scale: 0.9,
          opacity: 0,
          y: 20,
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 26,
        }}
        className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-[#150e28]/95 border border-white/10 backdrop-blur-xl text-white" : "bg-white border border-gray-200 text-gray-800 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.15)]"}`}
        style={{
          boxShadow: isDark
            ? "0 20px 60px rgba(139,92,246,0.4)"
            : "0 15px 40px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}
        >
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-violet-300" />
            <h3
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50 hover:text-white" : "hover:bg-black/5 text-gray-400 hover:text-gray-605"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div
          className={`px-4 py-3 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}
        >
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isDark ? "bg-white/10 border border-white/15" : "bg-black/4 border border-black/5"}`}
          >
            <Search
              className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`}
            />
            <input
              autoFocus
              type="text"
              placeholder={searchPlaceholder}
              value={composeSearch}
              onChange={(e) => setComposeSearch(e.target.value)}
              className={`flex-1 bg-transparent outline-none text-sm ${isDark ? "placeholder-white/30 text-white" : "placeholder-gray-400 text-gray-850"}`}
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto py-2 compose-modal-scroll">
          {filtered.length === 0 && (
            <p
              className={`text-center text-xs py-8 ${isDark ? "text-white/40" : "text-gray-400"}`}
            >
              {noResultsLabel}
            </p>
          )}
          {filtered.map((contact) => (
            <button
              key={contact.id}
              onClick={() => {
                onSelectContact(contact.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out text-left group ${isDark ? "hover:bg-white/8" : "hover:bg-black/4"}`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 rounded-full ${isDark ? "border-[#150e28]" : "border-white"}`}
                  style={{ display: contact.online ? "block" : "none" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium truncate ${isDark ? "text-white/90" : "text-gray-900"}`}
                  >
                    {contact.name}
                  </p>
                  {contact.isGroup && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-400 text-white">
                      {groupBadge}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs truncate ${isDark ? "text-white/40" : "text-gray-500"}`}
                >
                  {contact.lastMessage}
                </p>
              </div>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${contact.online ? "bg-green-400" : isDark ? "bg-white/20" : "bg-gray-300"}`}
              />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Thread Panel ─────────────────────────────────────────────────────────────
const ThreadPanel = ({
  parentMsg,
  activeContact,
  onClose,
  onSendThread,
  isDark,
  threadLabel,
  originalLabel,
  replyPlaceholder,
}: {
  parentMsg: Message;
  activeContact: Contact;
  onClose: () => void;
  onSendThread: (msgId: string, text: string) => void;
  isDark: boolean;
  threadLabel: string;
  originalLabel: string;
  replyPlaceholder: string;
}) => {
  const [threadInput, setThreadInput] = useState("");
  const threadScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (threadScrollRef.current)
      threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight;
  }, [parentMsg.threadMessages]);
  return (
    <motion.div
      initial={{
        x: "100%",
        opacity: 0,
      }}
      animate={{
        x: 0,
        opacity: 1,
      }}
      exit={{
        x: "100%",
        opacity: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`w-72 flex-shrink-0 border-l flex flex-col overflow-hidden ${isDark ? "border-white/10" : "border-black/5"}`}
      style={{
        background: isDark ? "rgba(15,5,40,0.65)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div
        className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <div className="flex items-center gap-2">
          <MessageSquare
            className={`w-4 h-4 ${isDark ? "text-violet-300" : "text-violet-500"}`}
          />
          <h3
            className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {threadLabel}
          </h3>
        </div>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div
        className={`px-4 py-3 border-b flex-shrink-0 ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/4"}`}
      >
        <div
          className={`border rounded-xl px-3 py-2.5 ${isDark ? "border-white/15 bg-white/8" : "border-black/5 bg-white/80"}`}
        >
          <p
            className={`text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-400"}`}
          >
            {originalLabel}
          </p>
          <p
            className={`text-xs line-clamp-3 ${isDark ? "text-white/70" : "text-gray-700"}`}
          >
            {parentMsg.text}
          </p>
        </div>
      </div>
      <div
        ref={threadScrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {(parentMsg.threadMessages || []).map((tm) => {
          const isTMe = tm.senderId === "me";
          return (
            <div
              key={tm.id}
              className={`flex items-end gap-2 ${isTMe ? "justify-end" : "justify-start"}`}
            >
              {!isTMe && (
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div
                className={`px-3 py-2 text-xs rounded-2xl max-w-[80%] transition-all duration-200 ease-in-out hover:brightness-110 ${isTMe ? "rounded-br-md text-white" : `rounded-bl-md ${isDark ? "text-white/80" : "text-gray-800"}`}`}
                style={{
                  background: isTMe
                    ? "linear-gradient(135deg,rgba(124,58,237,0.6),rgba(168,85,247,0.5),rgba(6,182,212,0.45))"
                    : isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.85)",
                  border: isTMe
                    ? "1px solid rgba(167,139,250,0.35)"
                    : isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {tm.text}
              </div>
              {isTMe && (
                <img
                  src="https://i.pravatar.cc/150?img=5"
                  alt="You"
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              )}
            </div>
          );
        })}
      </div>
      <div
        className={`px-4 py-3 border-t flex-shrink-0 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-2 ${isDark ? "rounded-xl bg-white/10 border border-white/15" : "rounded-full bg-black/5 border border-black/5"}`}
        >
          <input
            type="text"
            placeholder={replyPlaceholder}
            value={threadInput}
            onChange={(e) => setThreadInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && threadInput.trim()) {
                onSendThread(parentMsg.id, threadInput.trim());
                setThreadInput("");
              }
            }}
            className={`flex-1 bg-transparent outline-none text-xs ${isDark ? "placeholder-white/30 text-white" : "placeholder-gray-400 text-gray-800"}`}
          />
          <button
            onClick={() => {
              if (threadInput.trim()) {
                onSendThread(parentMsg.id, threadInput.trim());
                setThreadInput("");
              }
            }}
            disabled={!threadInput.trim()}
            className="w-7 h-7 rounded-full disabled:opacity-40 flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
            }}
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const formatRepliesCount = (count: number, currentLang: Lang) => {
  if (currentLang === "ru") {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return `${count} ответ`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return `${count} ответа`;
    }
    return `${count} ответов`;
  }
  if (currentLang === "tg") {
    return `${count} ҷавоб`;
  }
  return `${count} ${count === 1 ? "reply" : "replies"}`;
};

interface IProps {
  onComposeStateChange?: (isOpen: boolean) => void;
  /** Закрыть чат по клику на пустое пространство за окном чата. */
  onRequestClose?: () => void;
}

export const ChatApp = ({ onComposeStateChange, onRequestClose }: IProps) => {
  const [isSystemDark, setIsSystemDark] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return document.documentElement.classList.contains("dark");
  });
  const isDark = isSystemDark;

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsSystemDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const [lang, setLang] = useState<Lang>("en");
  const [layout, setLayout] = useState<LayoutPosition>("left");
  const t = TRANSLATIONS[lang];
  const cycleLang = () =>
    setLang((prev: Lang) =>
      prev === "en" ? "ru" : prev === "ru" ? "tg" : "en",
    );
  const LANG_LABELS: Record<Lang, string> = {
    en: "EN",
    ru: "RU",
    tg: "TG",
  };
  const EMOJI_CATEGORIES_LOCALIZED: EmojiCategory[] = EMOJI_CATEGORY_EMOJIS.map(
    (emojis, i) => ({
      label: t[EMOJI_CATEGORIES_KEYS[i]],
      emojis,
    }),
  );
  const SCHEDULE_OPTIONS_LOCALIZED = [
    {
      label: t.in1Hour,
      offset: 60,
    },
    {
      label: t.in3Hours,
      offset: 180,
    },
    {
      label: t.tomorrow9am,
      offset: 840,
    },
    {
      label: t.tomorrow6pm,
      offset: 1080,
    },
    {
      label: t.monday9am,
      offset: 2880,
    },
  ];
  const [activeContactId, setActiveContactId] = useState<string>("7");
  const [prevContactId, setPrevContactId] = useState<string | null>(null);
  const [switchDirection, setSwitchDirection] = useState<1 | -1>(1);
  const [messages] = useState<Message[]>(initialMessages);
  const [allMessages, setAllMessages] =
    useState<Record<string, Message[]>>(contactMessages);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [callState, setCallState] = useState<"none" | "audio" | "video">(
    "none",
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [incomingCall, setIncomingCall] = useState<{
    callType: "audio" | "video";
  } | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [showPinnedBanner, setShowPinnedBanner] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);

  useEffect(() => {
    onComposeStateChange?.(showComposeModal);
  }, [showComposeModal, onComposeStateChange]);
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyPreview | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<Message | null>(null);
  const [activeActionMsgId, setActiveActionMsgId] = useState<string | null>(
    null,
  );
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [openThreadMsgId, setOpenThreadMsgId] = useState<string | null>(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [viewingStory, setViewingStory] = useState<Contact | null>(null);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [showDeleteConversation, setShowDeleteConversation] = useState(false);
  const [contactUnreads, setContactUnreads] = useState<Record<string, number>>(
    () => {
      const map: Record<string, number> = {};
      contacts.forEach((c) => {
        if (c.unreadCount) map[c.id] = c.unreadCount;
      });
      return map;
    },
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeContact =
    contacts.find((c) => c.id === activeContactId) || contacts[6];
  const currentMessages = allMessages[activeContactId] || [];
  const pinnedMessage = currentMessages.find((m) => m.pinned);
  const searchMatches = msgSearchQuery.trim()
    ? currentMessages.filter((m) =>
        m.text.toLowerCase().includes(msgSearchQuery.toLowerCase()),
      )
    : [];
  const openThreadMsg = openThreadMsgId
    ? currentMessages.find((m) => m.id === openThreadMsgId) || null
    : null;
  const lastReceivedMessage = [...currentMessages]
    .reverse()
    .find((m) => m.senderId !== "me");
  const deletingMsg = deletingMsgId
    ? currentMessages.find((m) => m.id === deletingMsgId) || null
    : null;
  const totalUnread = Object.values(contactUnreads).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [currentMessages, isTyping, activeContactId]);
  useEffect(() => {
    if (callState === "none") {
      setCallDuration(0);
      return;
    }
    const iv = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(iv);
  }, [callState]);

  useEffect(() => {
    setShowContactDrawer(false);
    setOpenThreadMsgId(null);
  }, [activeContactId]);
  useEffect(() => {
    if (searchMatches.length > 0 && searchMatchIndex < searchMatches.length) {
      const el = messageRefs.current[searchMatches[searchMatchIndex].id];
      if (el)
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [searchMatchIndex, searchMatches.length]);
  useEffect(() => {
    setContactUnreads((prev) => {
      const n = {
        ...prev,
      };
      delete n[activeContactId];
      return n;
    });
  }, [activeContactId]);
  const handleContactSwitch = (newId: string) => {
    if (newId === activeContactId) return;
    const currentIdx = contacts.findIndex((c) => c.id === activeContactId);
    const newIdx = contacts.findIndex((c) => c.id === newId);
    setSwitchDirection(newIdx > currentIdx ? 1 : -1);
    setPrevContactId(activeContactId);
    setActiveContactId(newId);
    setShowPinnedBanner(true);
    setIsTyping(false);
  };
  const handleSearchPrev = () =>
    setSearchMatchIndex(
      (i) => (i - 1 + searchMatches.length) % Math.max(searchMatches.length, 1),
    );
  const handleSearchNext = () =>
    setSearchMatchIndex((i) => (i + 1) % Math.max(searchMatches.length, 1));
  const handleMsgSearchChange = (v: string) => {
    setMsgSearchQuery(v);
    setSearchMatchIndex(0);
  };
  const handleSend = useCallback(() => {
    if (!input.trim() && pendingFiles.length === 0) return;
    const newMessages = [...(allMessages[activeContactId] || [])];
    if (pendingFiles.length > 0) {
      pendingFiles.forEach((f) => {
        newMessages.push({
          id: `m${Date.now()}-${f.name}`,
          senderId: "me",
          text: input.trim() || "",
          time: formatTime(new Date()),
          status: "sent",
          attachment: {
            name: f.name,
            size: f.size,
            type: f.type,
            preview: f.preview,
          },
          replyTo: replyingTo || undefined,
        });
      });
      setAllMessages((prev) => ({
        ...prev,
        [activeContactId]: newMessages,
      }));
      setPendingFiles([]);
      setInput("");
      setReplyingTo(null);
      return;
    }
    newMessages.push({
      id: `m${Date.now()}`,
      senderId: "me",
      text: input.trim(),
      time: formatTime(new Date()),
      status: "sent",
      replyTo: replyingTo || undefined,
    });
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: newMessages,
    }));
    setInput("");
    setReplyingTo(null);
    setIsTyping(false);
    const cid = activeContactId;
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setAllMessages((prev) => ({
          ...prev,
          [cid]: [
            ...(prev[cid] || []),
            {
              id: `m${Date.now() + 1}`,
              senderId: cid,
              text: "That's interesting! Tell me more about it.",
              time: formatTime(new Date()),
            },
          ],
        }));
        setIsTyping(false);
      }, 1800);
    }, 900);
  }, [input, pendingFiles, replyingTo, activeContactId, allMessages]);
  const handleSchedule = (label: string, _offset: number) => {
    if (!input.trim()) return;
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: [
        ...(prev[activeContactId] || []),
        {
          id: `m${Date.now()}-sched`,
          senderId: "me",
          text: input.trim(),
          time: formatTime(new Date()),
          status: "sent",
          scheduled: true,
          scheduledTime: label,
        },
      ],
    }));
    setInput("");
    setReplyingTo(null);
  };
  const handleSendVoice = (duration: number) => {
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: [
        ...(prev[activeContactId] || []),
        {
          id: `m${Date.now()}-voice`,
          senderId: "me",
          text: "",
          time: formatTime(new Date()),
          status: "sent",
          attachment: {
            name: "Voice message",
            size: "",
            type: "voice",
            duration,
          },
        },
      ],
    }));
    setIsRecording(false);
  };
  const handleForwardSend = (targetId: string) => {
    if (!forwardingMsg) return;
    if (targetId === activeContactId) {
      setAllMessages((prev) => ({
        ...prev,
        [activeContactId]: [
          ...(prev[activeContactId] || []),
          {
            id: `m${Date.now()}-fwd`,
            senderId: "me",
            text: forwardingMsg.text,
            time: formatTime(new Date()),
            status: "sent",
            forwarded: true,
          },
        ],
      }));
    }
    setForwardingMsg(null);
  };
  const handleDeleteForMe = useCallback(() => {
    const msgId = deletingMsgId;
    if (!msgId) return;
    setDeletingMsgId(null);
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map((m) =>
        m.id === msgId
          ? {
              ...m,
              deletedForMe: true,
              text: t.youDeletedThis,
            }
          : m,
      ),
    }));
  }, [deletingMsgId, t.youDeletedThis, activeContactId]);
  const handleDeleteForEveryone = useCallback(() => {
    const msgId = deletingMsgId;
    if (!msgId) return;
    setDeletingMsgId(null);
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map((m) =>
        m.id === msgId
          ? {
              ...m,
              deleted: true,
              text: t.messageDeleted,
            }
          : m,
      ),
    }));
  }, [deletingMsgId, t.messageDeleted, activeContactId]);
  const handleDeleteConversation = () => {
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: [],
    }));
    setShowDeleteConversation(false);
    setShowContactDrawer(false);
  };
  const handleSendThread = (msgId: string, text: string) => {
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map((m) =>
        m.id === msgId
          ? {
              ...m,
              threadMessages: [
                ...(m.threadMessages || []),
                {
                  id: `${msgId}-t${Date.now()}`,
                  senderId: "me",
                  text,
                  time: formatTime(new Date()),
                  status: "sent" as const,
                },
              ],
              threadCount: (m.threadCount || 0) + 1,
            }
          : m,
      ),
    }));
  };
  const handlePinMessage = (msgId: string) => {
    setAllMessages((prev) => {
      const messages = prev[activeContactId] || [];
      const targetMsg = messages.find((m) => m.id === msgId);
      const isAlreadyPinned = !!(targetMsg && targetMsg.pinned);
      return {
        ...prev,
        [activeContactId]: messages.map((m) => {
          if (m.id === msgId) {
            return {
              ...m,
              pinned: !isAlreadyPinned,
            };
          }
          return {
            ...m,
            pinned: false,
          };
        }),
      };
    });
    setShowPinnedBanner(true);
  };
  const handleReaction = (msgId: string, emoji: string) => {
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map((msg) => {
        if (msg.id !== msgId) return msg;
        const existing = (msg.reactions || []).find((r) => r.emoji === emoji);
        if (existing) {
          const updated = msg
            .reactions!.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.reactedByMe ? r.count - 1 : r.count + 1,
                    reactedByMe: !r.reactedByMe,
                  }
                : r,
            )
            .filter((r) => r.count > 0);
          return {
            ...msg,
            reactions: updated,
          };
        }
        return {
          ...msg,
          reactions: [
            ...(msg.reactions || []),
            {
              emoji,
              count: 1,
              reactedByMe: true,
            },
          ],
        };
      }),
    }));
    setHoveredMessageId(null);
  };
  const handleEmojiSelect = (emoji: string) => setInput((prev) => prev + emoji);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const mapped: PendingFile[] = selected.map((file) => {
      const sizeKb = file.size / 1024;
      const sizeStr =
        sizeKb > 1024
          ? `${(sizeKb / 1024).toFixed(1)} MB`
          : `${sizeKb.toFixed(0)} KB`;
      let type: MessageAttachment["type"] = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";
      const entry: PendingFile = {
        name: file.name,
        size: sizeStr,
        type,
        raw: file,
      };
      if (type === "image") entry.preview = URL.createObjectURL(file);
      return entry;
    });
    setPendingFiles((prev) => [...prev, ...mapped]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const removePendingFile = (name: string) => {
    setPendingFiles((prev) => {
      const removed = prev.find((f) => f.name === name);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.name !== name);
    });
  };
  const handleJumpToPinned = () => {
    if (pinnedMessage) {
      const el = messageRefs.current[pinnedMessage.id];
      if (el)
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  };
  const handleAcceptCall = () => {
    if (incomingCall) {
      setCallState(incomingCall.callType);
      setIncomingCall(null);
    }
  };
  const handleDeclineCall = () => setIncomingCall(null);
  const handleEndCall = () => {
    setCallState("none");
    setIsMuted(false);
    setIsVideoOff(false);
  };
  const isHighlighted = (msgId: string) =>
    msgSearchQuery.trim() && searchMatches.some((m) => m.id === msgId);
  const isCurrentMatch = (msgId: string) =>
    searchMatches.length > 0 && searchMatches[searchMatchIndex]?.id === msgId;
  const chatVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir * 32,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: -dir * 32,
    }),
  };
  void messages;
  void prevContactId;
  void isDark;

  // Determine flex direction based on layout
  const isHorizontalLayout = layout === "top" || layout === "bottom";
  const mainAreaFlexDir = isHorizontalLayout ? "flex-col" : "flex-row";
  const chatListFirst = layout === "left" || layout === "top";
  const chatListPanel = (
    <ChatListPanel
      layout={layout}
      contacts={contacts}
      activeContactId={activeContactId}
      contactUnreads={contactUnreads}
      searchQuery={searchQuery}
      onContactSwitch={handleContactSwitch}
      onComposeOpen={() => setShowComposeModal(true)}
      onSearchChange={setSearchQuery}
      isDark={isDark}
    />
  );
  const chatWindow = (
    <main
      className="flex-1 flex flex-col min-w-0 overflow-hidden"
      style={{
        background: "transparent",
      }}
    >
      {/* Chat sub-header */}
      <div
        className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${isDark ? "border-white/8" : "border-black/6"}`}
        style={{
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        <motion.div
          key={`header-${activeContactId}`}
          initial={{
            opacity: 0,
            x: switchDirection * 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.22,
            ease: "easeOut",
          }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="w-10 h-10 rounded-full object-cover"
              style={{
                border: "2px solid rgba(167,139,250,0.4)",
              }}
            />
            {activeContact.online && (
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-transparent rounded-full"
                style={{
                  boxShadow: "0 0 6px rgba(74,222,128,0.7)",
                }}
              />
            )}
          </div>
          <div>
            <h2
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {activeContact.name}
            </h2>
            <p
              className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {activeContact.online ? t.online : t.lastSeen}
            </p>
          </div>
        </motion.div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setShowMsgSearch((v) => !v);
              setMsgSearchQuery("");
              setSearchMatchIndex(0);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${showMsgSearch ? "bg-violet-500/30 text-violet-300" : isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() =>
              setIncomingCall({
                callType: "audio",
              })
            }
            className={`w-9 h-9 rounded-full flex items-center justify-center text-amber-500 transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-amber-500/15" : "hover:bg-amber-50"}`}
          >
            <PhoneIncoming className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setCallState("video")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
          >
            <Video className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setCallState("audio")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
          >
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setShowContactDrawer((v) => !v)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${showContactDrawer ? "bg-violet-500/30 text-violet-500" : isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
          >
            <UserCog className="w-4.5 h-4.5" />
          </button>
          <div
            className={`w-px h-5 mx-1 ${isDark ? "bg-white/15" : "bg-black/10"}`}
          />
          <button
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

      <AnimatePresence>
        {showMsgSearch && (
          <MessageSearchBar
            query={msgSearchQuery}
            onChange={handleMsgSearchChange}
            onClose={() => {
              setShowMsgSearch(false);
              setMsgSearchQuery("");
            }}
            matchCount={searchMatches.length}
            currentMatch={searchMatchIndex}
            onPrev={handleSearchPrev}
            onNext={handleSearchNext}
            isDark={isDark}
            placeholder={t.searchMessagesPlaceholder}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pinnedMessage && showPinnedBanner && (
          <PinnedBanner
            message={pinnedMessage}
            onDismiss={() => setShowPinnedBanner(false)}
            onJump={handleJumpToPinned}
            isDark={isDark}
            label={t.pinnedMessage}
          />
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: isDark ? "transparent" : "rgba(248,247,255,0.5)",
        }}
      >
        <AnimatePresence mode="wait" custom={switchDirection}>
          <motion.div
            key={activeContactId}
            custom={switchDirection}
            variants={chatVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.25,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto px-6 pt-14 pb-6 space-y-5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: isDark
                ? "rgba(167,139,250,0.3) transparent"
                : "rgba(167,139,250,0.25) transparent",
              overflowX: "clip",
            }}
          >
            {currentMessages.map((msg) => {
              const isMe = msg.senderId === "me";
              const highlighted = isHighlighted(msg.id);
              const currentMatchMsg = isCurrentMatch(msg.id);
              const isEffectivelyDeleted = msg.deleted || msg.deletedForMe;
              return (
                <motion.div
                  key={msg.id}
                  ref={(el) => {
                    messageRefs.current[msg.id] = el;
                  }}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className={`flex items-end ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`inline-flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {!isMe && (
                      <img
                        src={activeContact.avatar}
                        alt={activeContact.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end"
                        style={{
                          border: "2px solid rgba(167,139,250,0.35)",
                        }}
                      />
                    )}
                    <div
                      className={`flex flex-col max-w-[65vw] sm:max-w-[420px] ${isMe ? "items-end" : "items-start"}`}
                    >
                      {msg.scheduled && !isEffectivelyDeleted && (
                        <div
                          className={`flex items-center gap-1 mb-1 text-[10px] font-medium ${isMe ? "self-end" : "self-start"} ${isDark ? "text-amber-400" : "text-amber-600"}`}
                        >
                          <Clock3 className="w-3 h-3" />
                          <span>
                            {t.scheduled} · {msg.scheduledTime}
                          </span>
                        </div>
                      )}
                      {msg.replyTo && !isEffectivelyDeleted && (
                        <div
                          className={`flex items-center gap-2 mb-1 px-3 py-1.5 rounded-xl border-l-4 border-violet-400 text-xs max-w-full ${isMe ? "self-end" : "self-start"} ${isDark ? "bg-violet-500/15" : "bg-violet-100/70"}`}
                        >
                          <CornerUpLeft className="w-3 h-3 text-violet-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <span
                              className={`font-semibold text-[10px] ${isDark ? "text-violet-300" : "text-violet-600"}`}
                            >
                              {msg.replyTo.senderName}
                            </span>
                            <p
                              className={`truncate max-w-[200px] ${isDark ? "text-white/60" : "text-gray-600"}`}
                            >
                              {msg.replyTo.text}
                            </p>
                          </div>
                        </div>
                      )}
                      {msg.forwarded && !isEffectivelyDeleted && (
                        <div
                          className={`flex items-center gap-1 mb-1 text-[10px] ${isDark ? "text-white/40" : "text-gray-400"} ${isMe ? "self-end" : "self-start"}`}
                        >
                          <Forward className="w-3 h-3" />
                          <span>{t.forwarded}</span>
                        </div>
                      )}
                      {msg.attachment?.type === "voice" &&
                        !isEffectivelyDeleted && (
                          <VoiceBubble
                            duration={msg.attachment.duration || 5}
                            isMe={isMe}
                            isDark={isDark}
                          />
                        )}
                      {msg.attachment &&
                        msg.attachment.type !== "voice" &&
                        !isEffectivelyDeleted && (
                          <div
                            className={`mb-1.5 rounded-2xl overflow-hidden transition-all duration-200 ease-in-out hover:brightness-110 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}
                            style={{
                              border: isMe
                                ? "1px solid rgba(167,139,250,0.35)"
                                : "1px solid rgba(255,255,255,0.12)",
                            }}
                          >
                            {msg.attachment.type === "image" &&
                            msg.attachment.preview ? (
                              <img
                                src={msg.attachment.preview}
                                alt={msg.attachment.name}
                                className="max-w-[220px] max-h-48 object-cover"
                              />
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2.5 min-w-[180px] bg-white/8">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-violet-300 flex-shrink-0 bg-violet-500/20">
                                  {getAttachmentIcon(msg.attachment.type)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate text-white/80">
                                    {msg.attachment.name}
                                  </p>
                                  <p className="text-[10px] text-white/40">
                                    {msg.attachment.size}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      {(msg.text || isEffectivelyDeleted) && (
                        <div className="relative">
                          <AnimatePresence>
                            {hoveredMessageId === msg.id &&
                              !isEffectivelyDeleted && (
                                <ReactionPicker
                                  isMe={isMe}
                                  onSelect={(emoji) =>
                                    handleReaction(msg.id, emoji)
                                  }
                                  isDark={isDark}
                                />
                              )}
                          </AnimatePresence>
                          <AnimatePresence>
                            {hoveredMessageId === msg.id &&
                              !isEffectivelyDeleted && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                  }}
                                  animate={{
                                    opacity: 1,
                                  }}
                                  exit={{
                                    opacity: 0,
                                  }}
                                  className={`absolute -top-3.5 ${isMe ? "-left-8" : "-right-8"} flex items-center z-20`}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionMsgId((prev) =>
                                        prev === msg.id ? null : msg.id,
                                      );
                                    }}
                                    className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/60 hover:bg-white/20" : "text-gray-500 hover:bg-black/8"}`}
                                    style={{
                                      background: isDark
                                        ? "rgba(255,255,255,0.1)"
                                        : "rgba(0,0,0,0.05)",
                                      border: isDark
                                        ? "1px solid rgba(255,255,255,0.15)"
                                        : "1px solid rgba(0,0,0,0.08)",
                                    }}
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </button>
                                </motion.div>
                              )}
                          </AnimatePresence>
                          <AnimatePresence>
                            {activeActionMsgId === msg.id && (
                              <MessageActionMenu
                                isMe={isMe}
                                isDark={isDark}
                                onReply={() => {
                                  setReplyingTo({
                                    id: msg.id,
                                    senderName: isMe
                                      ? "You"
                                      : activeContact.name,
                                    text: msg.text,
                                  });
                                  setActiveActionMsgId(null);
                                }}
                                onForward={() => {
                                  setForwardingMsg(msg);
                                  setActiveActionMsgId(null);
                                }}
                                onDelete={() => {
                                  setDeletingMsgId(msg.id);
                                  setActiveActionMsgId(null);
                                }}
                                onThread={() => {
                                  setOpenThreadMsgId(msg.id);
                                  setShowContactDrawer(false);
                                  setActiveActionMsgId(null);
                                }}
                                onPin={() => {
                                  handlePinMessage(msg.id);
                                  setActiveActionMsgId(null);
                                }}
                                pinLabel={
                                  msg.pinned
                                    ? lang === "ru"
                                      ? "Открепить"
                                      : lang === "tg"
                                        ? "Ҷудо кардан"
                                        : "Unpin"
                                    : lang === "ru"
                                      ? "Закрепить"
                                      : lang === "tg"
                                        ? "Маҳкам кардан"
                                        : "Pin"
                                }
                                onClose={() => setActiveActionMsgId(null)}
                              />
                            )}
                          </AnimatePresence>
                          <div
                            className={`px-4 py-2.5 text-sm leading-relaxed transition-all duration-200 ease-in-out cursor-default ${
                              isEffectivelyDeleted
                                ? isDark
                                  ? "italic text-white/30 rounded-2xl border border-dashed border-white/15 bg-white/4"
                                  : "italic text-black/35 rounded-2xl border border-dashed border-black/10 bg-black/4"
                                : currentMatchMsg
                                  ? "rounded-2xl ring-2 ring-amber-400 text-amber-100"
                                  : highlighted
                                    ? "rounded-2xl text-amber-200"
                                    : msg.threadCount && msg.threadCount > 0
                                      ? isMe
                                        ? "rounded-2xl rounded-br-md text-white ring-1 ring-violet-300/40 shadow-[0_0_15px_rgba(167,139,250,0.35)]"
                                        : `rounded-2xl rounded-bl-md ring-1 ring-violet-400/50 shadow-[0_0_15px_rgba(124,58,237,0.25)] ${isDark ? "text-white/95" : "text-violet-950 font-medium"}`
                                      : isMe
                                        ? "rounded-2xl rounded-br-md text-white"
                                        : `rounded-2xl rounded-bl-md ${isDark ? "text-white/90" : "text-gray-800"}`
                            }`}
                            style={
                              isEffectivelyDeleted
                                ? {}
                                : currentMatchMsg
                                  ? {
                                      background: "rgba(251,191,36,0.25)",
                                      border: "1px solid rgba(251,191,36,0.4)",
                                    }
                                  : highlighted
                                    ? {
                                        background: "rgba(251,191,36,0.15)",
                                        border:
                                          "1px solid rgba(251,191,36,0.3)",
                                      }
                                    : msg.threadCount && msg.threadCount > 0
                                      ? isMe
                                        ? {
                                            background:
                                              "linear-gradient(135deg,rgba(124,58,237,0.75),rgba(168,85,247,0.65),rgba(6,182,212,0.6))",
                                            border:
                                              "1.5px solid rgba(196,181,253,0.65)",
                                            boxShadow:
                                              "0 4px 20px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                                            backgroundClip: "padding-box",
                                          }
                                        : {
                                            background: "rgba(124,58,237,0.15)",
                                            border:
                                              "1.5px solid rgba(167,139,250,0.4)",
                                            boxShadow:
                                              "0 2px 12px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
                                            backgroundClip: "padding-box",
                                          }
                                      : isMe
                                        ? {
                                            background:
                                              "linear-gradient(135deg,rgba(124,58,237,0.65),rgba(168,85,247,0.55),rgba(6,182,212,0.5))",
                                            border:
                                              "1px solid rgba(167,139,250,0.4)",
                                            boxShadow:
                                              "0 4px 20px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
                                            backgroundClip: "padding-box",
                                          }
                                        : {
                                            background: isDark
                                              ? "rgba(255,255,255,0.1)"
                                              : "rgba(255,255,255,0.85)",
                                            border: isDark
                                              ? "1px solid rgba(255,255,255,0.15)"
                                              : "1px solid rgba(0,0,0,0.08)",
                                            boxShadow: isDark
                                              ? "0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                                              : "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                                            backgroundClip: "padding-box",
                                          }
                            }
                            onMouseEnter={(e) => {
                              if (
                                !isEffectivelyDeleted &&
                                !currentMatchMsg &&
                                !highlighted
                              ) {
                                if (isMe) {
                                  (
                                    e.currentTarget as HTMLDivElement
                                  ).style.boxShadow = isDark
                                    ? "0 8px 32px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"
                                    : "0 8px 32px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
                                  (
                                    e.currentTarget as HTMLDivElement
                                  ).style.filter = "brightness(1.08)";
                                } else {
                                  (
                                    e.currentTarget as HTMLDivElement
                                  ).style.boxShadow = isDark
                                    ? "0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)"
                                    : "0 6px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";
                                  (
                                    e.currentTarget as HTMLDivElement
                                  ).style.filter = "brightness(1.06)";
                                }
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isEffectivelyDeleted) {
                                (
                                  e.currentTarget as HTMLDivElement
                                ).style.filter = "";
                                if (isMe) {
                                  (
                                    e.currentTarget as HTMLDivElement
                                  ).style.boxShadow = isDark
                                    ? "0 4px 20px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.12)"
                                    : "0 4px 20px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.12)";
                                } else {
                                  (
                                    e.currentTarget as HTMLDivElement
                                  ).style.boxShadow = isDark
                                    ? "0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                                    : "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)";
                                }
                              }
                            }}
                          >
                            <If is={!!(msg.pinned && !isEffectivelyDeleted)}>
                              <span className="inline-flex items-center gap-1 text-[10px] text-violet-300 font-semibold mb-1 mr-2">
                                <Pin className="w-2.5 h-2.5" />
                                <span>{t.pinned}</span>
                              </span>
                            </If>
                            {msg.text}
                          </div>
                        </div>
                      )}
                      <If
                        is={
                          ((msg.reactions && msg.reactions.length > 0) ||
                            (msg.threadCount && msg.threadCount > 0)) &&
                          !isEffectivelyDeleted
                        }
                      >
                        <div
                          className={`flex flex-wrap gap-1.5 mt-1 ${isMe ? "self-end justify-end" : "self-start justify-start"}`}
                        >
                          <If
                            is={!!(msg.reactions && msg.reactions.length > 0)}
                          >
                            <>
                              {msg.reactions?.map((r) => (
                                <button
                                  key={r.emoji}
                                  onClick={() =>
                                    handleReaction(msg.id, r.emoji)
                                  }
                                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all duration-200 ease-in-out hover:scale-110"
                                  style={{
                                    background: r.reactedByMe
                                      ? "rgba(124,58,237,0.3)"
                                      : isDark
                                        ? "rgba(255,255,255,0.08)"
                                        : "rgba(0,0,0,0.04)",
                                    border: r.reactedByMe
                                      ? "1px solid rgba(167,139,250,0.5)"
                                      : isDark
                                        ? "1px solid rgba(255,255,255,0.12)"
                                        : "1px solid rgba(0,0,0,0.08)",
                                  }}
                                >
                                  <span>{r.emoji}</span>
                                  <span
                                    className={`text-[10px] font-medium ${isDark ? "text-white/60" : "text-gray-550"}`}
                                  >
                                    {r.count}
                                  </span>
                                </button>
                              ))}
                            </>
                          </If>
                          <If is={!!(msg.threadCount && msg.threadCount > 0)}>
                            <button
                              onClick={() => {
                                setOpenThreadMsgId(msg.id);
                                setShowContactDrawer(false);
                              }}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-200 ease-in-out hover:scale-105 cursor-pointer ${isDark ? "text-violet-200" : "text-violet-750"}`}
                              style={{
                                background: isDark
                                  ? "rgba(124,58,237,0.25)"
                                  : "rgba(124,58,237,0.12)",
                                border: isDark
                                  ? "1px solid rgba(167,139,250,0.4)"
                                  : "1px solid rgba(124,58,237,0.25)",
                                boxShadow: isDark
                                  ? "0 2px 10px rgba(124,58,237,0.25)"
                                  : "0 2px 8px rgba(124,58,237,0.08)",
                              }}
                            >
                              <MessageSquare
                                className={`w-3 h-3 ${isDark ? "text-violet-300" : "text-violet-600"}`}
                              />
                              <span>
                                {formatRepliesCount(msg.threadCount || 0, lang)}
                              </span>
                            </button>
                          </If>
                        </div>
                      </If>
                    </div>
                    {isMe && (
                      <img
                        src="https://i.pravatar.cc/150?img=5"
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end"
                        style={{
                          border: "2px solid rgba(167,139,250,0.35)",
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="flex items-end gap-2 justify-start"
                >
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    style={{
                      border: "2px solid rgba(167,139,250,0.35)",
                    }}
                  />
                  <div
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-md"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(255,255,255,0.85)",
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.15)"
                        : "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <span
                      className={`text-xs mr-1 ${isDark ? "text-white/40" : "text-gray-400"}`}
                    >
                      {t.typing}
                    </span>
                    <span className="flex gap-0.5">
                      <motion.span
                        className="w-1 h-1 rounded-full bg-violet-300"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      />
                      <motion.span
                        className="w-1 h-1 rounded-full bg-violet-300"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                      <motion.span
                        className="w-1 h-1 rounded-full bg-violet-300"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                      />
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAIPanel && lastReceivedMessage && (
          <AIPanel
            lastMessage={lastReceivedMessage.text}
            onSelect={(text) => setInput(text)}
            onClose={() => setShowAIPanel(false)}
            isDark={isDark}
            title={t.aiSuggestions}
            loadingText={t.generatingSuggestions}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {replyingTo && (
          <ReplyBar
            reply={replyingTo}
            onCancel={() => setReplyingTo(null)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingFiles.length > 0 && (
          <AttachmentPreviewBar
            files={pendingFiles}
            onRemove={removePendingFile}
            onSend={handleSend}
            isDark={isDark}
            countLabel={`${pendingFiles.length} ${t.filesReadyToSend}`}
            sendAllLabel={t.sendAll}
          />
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div
        className={`px-6 py-4 border-t flex-shrink-0 ${isDark ? "border-white/8" : "border-black/5"}`}
        style={{
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.4)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          className="relative flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.95)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.15)"
              : "1px solid rgba(167,139,250,0.25)",
          }}
        >
          {isRecording ? (
            <VoiceRecorder
              onSend={handleSendVoice}
              onCancel={() => setIsRecording(false)}
              isDark={isDark}
            />
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"} ${showEmojiPicker ? (isDark ? "text-violet-300 bg-white/10" : "text-violet-650 bg-violet-100") : isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-650"}`}
                >
                  <Smile className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {showEmojiPicker && (
                    <EmojiPicker
                      categories={EMOJI_CATEGORIES_LOCALIZED}
                      onSelect={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                      isDark={isDark}
                    />
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8 text-white/40 hover:text-white/70" : "hover:bg-black/5 text-gray-400 hover:text-gray-650"}`}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
              />
              <button
                onClick={() => setShowAIPanel((v) => !v)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"} ${showAIPanel ? (isDark ? "text-violet-300 bg-white/10" : "text-violet-650 bg-violet-100") : isDark ? "text-white/40 hover:text-violet-300" : "text-gray-400 hover:text-violet-600"}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder={t.typeMessage}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className={`flex-1 bg-transparent outline-none text-sm px-2 py-2 ${isDark ? "placeholder-white/25 text-white" : "placeholder-gray-400 text-gray-800"}`}
              />
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowSchedulePicker((v) => !v)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"} ${showSchedulePicker ? (isDark ? "text-violet-300 bg-white/10" : "text-violet-650 bg-violet-100") : isDark ? "text-white/40 hover:text-amber-400" : "text-gray-400 hover:text-amber-600"}`}
                >
                  <Clock3 className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {showSchedulePicker && (
                    <SchedulePicker
                      options={SCHEDULE_OPTIONS_LOCALIZED}
                      title={t.scheduleMessage}
                      onSchedule={handleSchedule}
                      onClose={() => setShowSchedulePicker(false)}
                      isDark={isDark}
                    />
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => setIsRecording(true)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8 text-white/40 hover:text-red-400" : "hover:bg-black/5 text-gray-400 hover:text-red-550"}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() && pendingFiles.length === 0}
                className="w-9 h-9 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110 hover:brightness-110 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.5)",
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
  return (
    <div
      className="w-full h-screen flex items-center justify-end py-4 pl-4 font-sans relative overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onRequestClose?.();
      }}
    >
      <div
        className="w-full max-w-7xl h-full max-h-[900px] flex flex-col rounded-l-2xl overflow-hidden shadow-2xl relative"
        style={{
          background: isDark ? "rgba(10,4,30,0.55)" : "rgba(255,255,255,0.72)",
          backdropFilter: "blur(30px)",
          border: isDark
            ? "1px solid rgba(167,139,250,0.2)"
            : "1px solid rgba(167,139,250,0.18)",
          boxShadow: isDark
            ? "0 30px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 30px 80px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* ── Top Header Bar ── */}
        <header
          className="flex-shrink-0"
          style={{
            background: isDark
              ? "linear-gradient(135deg,rgba(76,29,149,0.6),rgba(124,58,237,0.45),rgba(6,182,212,0.3))"
              : "linear-gradient(135deg,rgba(124,58,237,0.85),rgba(139,92,246,0.8),rgba(6,182,212,0.7))",
            borderBottom: isDark
              ? "1px solid rgba(167,139,250,0.2)"
              : "1px solid rgba(124,58,237,0.25)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-white"
                >
                  <path
                    d="M12 2C7 2 3 5.5 3 10c0 2.5 1.3 4.7 3.3 6.2L5 21l4.5-2.3c.8.2 1.6.3 2.5.3 5 0 9-3.5 9-8s-4-9-9-9z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span
                className="font-bold text-lg tracking-wider text-white"
                style={{
                  textShadow: "0 0 20px rgba(167,139,250,0.5)",
                }}
              >
                TECH
              </span>
              {totalUnread > 0 && (
                <motion.span
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="min-w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#f97316)",
                  }}
                >
                  {totalUnread > 99 ? "99+" : totalUnread}
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Layout Switcher */}
              <LayoutSwitcher
                layout={layout}
                onChange={setLayout}
                isDark={isDark}
              />
              <div className="w-px h-5 bg-white/15" />
              <button
                onClick={cycleLang}
                className="h-8 px-3 rounded-full text-white flex items-center gap-1.5 transition-all duration-200 ease-in-out hover:bg-white/20 hover:scale-105 text-xs font-bold"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Languages className="w-4.5 h-4.5" />
                <span>{LANG_LABELS[lang]}</span>
              </button>
              <button
                onClick={() => setShowComposeModal(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:bg-white/25 hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Edit3 className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setShowComposeModal(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:bg-white/18 hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <Plus className="w-4.5 h-4.5" strokeWidth={2.5} />
              </button>
              <button className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-white/15 hover:scale-110 flex items-center justify-center text-white/70">
                <UserPlus className="w-4.5 h-4.5" />
              </button>
              <button className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-white/15 hover:scale-110 flex items-center justify-center text-white/70">
                <MoreVertical className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Main content area with dynamic layout ── */}
        <div
          className={`flex flex-1 min-h-0 overflow-hidden ${mainAreaFlexDir}`}
        >
          {chatListFirst && chatListPanel}

          <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
            {chatWindow}

            <AnimatePresence>
              {showContactDrawer && !openThreadMsgId && (
                <ContactInfoDrawer
                  contact={activeContact}
                  onClose={() => setShowContactDrawer(false)}
                  onDeleteConversation={() => {
                    setShowDeleteConversation(true);
                    setShowContactDrawer(false);
                  }}
                  isDark={isDark}
                  t={t}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {openThreadMsg && (
                <ThreadPanel
                  parentMsg={openThreadMsg}
                  activeContact={activeContact}
                  onClose={() => setOpenThreadMsgId(null)}
                  onSendThread={handleSendThread}
                  isDark={isDark}
                  threadLabel={t.thread}
                  originalLabel={t.originalMessage}
                  replyPlaceholder={t.replyInThread}
                />
              )}
            </AnimatePresence>
          </div>

          {!chatListFirst && chatListPanel}
        </div>
      </div>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory && (
          <StoryViewer
            contact={viewingStory}
            onClose={() => setViewingStory(null)}
            hoursAgo={t.hoursAgo}
          />
        )}
      </AnimatePresence>

      {/* Incoming Call */}
      <AnimatePresence>
        {incomingCall && (
          <IncomingCallScreen
            contact={activeContact}
            callType={incomingCall.callType}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
            declineLabel={t.decline}
            acceptLabel={t.accept}
            incomingVideoLabel={t.incomingVideo}
            incomingVoiceLabel={t.incomingVoice}
          />
        )}
      </AnimatePresence>

      {/* Active Call Modal */}
      <AnimatePresence>
        {callState !== "none" && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(20px)",
            }}
          >
            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              className="relative w-full max-w-2xl h-[560px] rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg,rgba(76,29,149,0.8),rgba(124,58,237,0.7),rgba(6,182,212,0.6))",
                border: "1px solid rgba(167,139,250,0.4)",
                backdropFilter: "blur(30px)",
                boxShadow: "0 30px 80px rgba(124,58,237,0.5)",
              }}
            >
              {callState === "video" && !isVideoOff ? (
                <div className="w-full h-full">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="relative"
                  >
                    <div
                      className="absolute inset-0 rounded-full opacity-40 animate-ping"
                      style={{
                        background:
                          "radial-gradient(circle,rgba(167,139,250,0.6),transparent)",
                      }}
                    />
                    <img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="relative w-40 h-40 rounded-full object-cover"
                      style={{
                        border: "4px solid rgba(167,139,250,0.4)",
                      }}
                    />
                  </motion.div>
                </div>
              )}
              {callState === "video" && (
                <div
                  className="absolute top-5 right-5 w-32 h-44 rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    border: "2px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.5)",
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
                      <VideoOff className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>
              )}
              <div className="absolute top-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold drop-shadow">
                      {activeContact.name}
                    </h2>
                    <p className="text-sm text-white/70 mt-1">
                      <span>
                        {callState === "video"
                          ? t.videoCallLabel
                          : t.voiceCallLabel}
                      </span>
                      <span> · {formatDuration(callDuration)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setCallState("none")}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 text-white"
                    style={{
                      background: isMuted
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: isMuted ? "#7c3aed" : "white",
                    }}
                  >
                    {isMuted ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </button>
                  {callState === "video" && (
                    <button
                      onClick={() => setIsVideoOff((v) => !v)}
                      className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
                      style={{
                        background: isVideoOff
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        color: isVideoOff ? "#7c3aed" : "white",
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
                    className="w-14 h-14 rounded-full text-white flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleEndCall}
                    className="w-16 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-105 shadow-lg"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <AnimatePresence>
        {showComposeModal && (
          <ComposeModal
            onClose={() => setShowComposeModal(false)}
            onSelectContact={(id) => setActiveContactId(id)}
            isDark={isDark}
            title={t.newMessage}
            searchPlaceholder={t.searchContacts}
            noResultsLabel={t.noContactsFound}
            groupBadge={t.groupBadge}
          />
        )}
      </AnimatePresence>

      {/* Forward Modal */}
      <AnimatePresence>
        {forwardingMsg && (
          <motion.div
            onClick={() => setForwardingMsg(null)}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.25)",
              backdropFilter: "blur(20px)",
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{
                scale: 0.9,
                opacity: 0,
                y: 20,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
                y: 20,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
              }}
              className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-[#150e28]/95 border border-white/10 backdrop-blur-xl text-white" : "bg-white border border-gray-200 text-gray-800 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.15)]"}`}
              style={{
                boxShadow: isDark
                  ? "0 20px 60px rgba(139,92,246,0.4)"
                  : "0 15px 40px rgba(0,0,0,0.08)",
              }}
            >
              <div
                className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}
              >
                <div className="flex items-center gap-2">
                  <Forward className="w-4 h-4 text-violet-300" />
                  <h3
                    className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {t.forwardMessage}
                  </h3>
                </div>
                <button
                  onClick={() => setForwardingMsg(null)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50 hover:text-white" : "hover:bg-black/5 text-gray-400 hover:text-gray-605"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div
                className={`px-5 py-3 border-b ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}
              >
                <p
                  className={`text-xs line-clamp-2 italic ${isDark ? "text-white/50" : "text-gray-500"}`}
                >
                  "{forwardingMsg.text}"
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto py-2 compose-modal-scroll">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleForwardSend(contact.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out text-left group ${isDark ? "hover:bg-white/8" : "hover:bg-black/4"}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 rounded-full ${isDark ? "border-[#150e28]" : "border-white"}`}
                        style={{ display: contact.online ? "block" : "none" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${isDark ? "text-white/90" : "text-gray-900"}`}
                      >
                        {contact.name}
                      </p>
                      <p
                        className={`text-xs truncate ${isDark ? "text-white/40" : "text-gray-500"}`}
                      >
                        {contact.lastMessage}
                      </p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${contact.online ? "bg-green-400" : isDark ? "bg-white/20" : "bg-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Message Modal */}
      <AnimatePresence>
        {deletingMsg && (
          <DeleteConfirmModal
            msgText={deletingMsg.text}
            isMe={deletingMsg.senderId === "me"}
            onDeleteForMe={handleDeleteForMe}
            onDeleteForEveryone={handleDeleteForEveryone}
            onCancel={() => setDeletingMsgId(null)}
            isDark={isDark}
            title={t.deleteMessage}
            subtitle={t.cannotBeUndone}
            deleteForMeLabel={t.deleteForMe}
            deleteForMeDesc={t.deleteForMeDesc}
            deleteForEveryoneLabel={t.deleteForEveryone}
            deleteForEveryoneDesc={t.deleteForEveryoneDesc}
            cancelLabel={t.cancel}
            deletingForMeLabel={t.deletingForMe}
            deletingForEveryoneLabel={t.deletingForEveryone}
          />
        )}
      </AnimatePresence>

      {/* Delete Conversation Modal */}
      <AnimatePresence>
        {showDeleteConversation && (
          <DeleteConversationModal
            contactName={activeContact.name}
            onConfirm={handleDeleteConversation}
            onCancel={() => setShowDeleteConversation(false)}
            isDark={isDark}
            title={t.deleteConversationTitle}
            descPrefix={t.deleteConversationDesc}
            deleteAllLabel={t.deleteAll}
            cancelLabel={t.cancel}
            shreddingLabel={t.shreddingConversation}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
