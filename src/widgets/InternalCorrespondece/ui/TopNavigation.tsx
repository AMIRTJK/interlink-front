import React, { useState } from "react";
import {
  InboxOutlined,
  SendOutlined,
  FileTextOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useGetQuery, useLogout } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft, LogOut } from "lucide-react";
import { Avatar, Tooltip } from "antd";
import UserAvatar from "../../../assets/images/user-avatar.jpg";
import { NavButton } from "./TopNavigationNavButton";
import {
  NavRegistryDropdown,
  NavRegistry,
} from "./NavRegistryDropdown";

const softMaterialPresets = [
  { name: "Lavender", primary: "#A78BFA", accent: "#DDD6FE" },
  { name: "Rose", primary: "#FB7185", accent: "#FECDD3" },
  { name: "Sky", primary: "#38BDF8", accent: "#BAE6FD" },
];

interface TopNavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  type: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => {
  const [activeNavRegistry, setActiveNavRegistry] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();
  const location = useLocation();

  const currentPreset = softMaterialPresets[0];

  const textPrimary = isDarkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-600";

  const { data: draftsDataResponse } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_DRAFTS,
    useToken: true,
  });

  const draftsData = (draftsDataResponse?.data?.data || []).map(
    (item: any) => ({
      id: String(item.id),
      title: item.subject || "Без темы",
      date: item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : "",
      from: item.recipients?.[0]?.user?.full_name,
      status: "Черновик",
    }),
  );

  const { data: incomingDataResponse } = useGetQuery({
    method: "GET",
    url: ApiRoutes.GET_INTERNAL_INCOMING,
  });

  const incomingData = (incomingDataResponse?.data?.data || []).map(
    (item: any) => ({
      id: String(item.id),
      title: item.subject || "Без темы",
      date: item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : "",
      from: item.recipients?.[0]?.user?.full_name,
      status: "Отправлено",
    }),
  );

  const { data: outgoingDataResponse } = useGetQuery({
    method: "GET",
    url: ApiRoutes.GET_INTERNAL_OUTGOING,
  });

  const outgoingData = (outgoingDataResponse?.data?.data || []).map(
    (item: any) => ({
      id: String(item.id),
      title: item.subject || "Без темы",
      date: item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : "",
      from: item.recipients?.[0]?.user?.full_name,
      status: "Отправлено",
    }),
  );

  const handleLogout = useLogout();

  const navRegistries: Record<string, NavRegistry> = {
    inbox: {
      label: "Входящие",
      items: incomingData,
    },
    sent: {
      label: "Отправленные",
      items: outgoingData,
    },
    drafts: {
      label: "Черновики",
      items: draftsData,
    },
  };

  const handleNavigate = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const internalIndex = pathSegments.indexOf("internal");

    if (internalIndex !== -1 && pathSegments[internalIndex + 1]) {
      const registryPath =
        "/" + pathSegments.slice(0, internalIndex + 2).join("/");
      navigate(registryPath);
    } else {
      navigate("/modules/correspondence/internal/incoming");
    }
  };

  return (
    <>
      <nav
        className="h-16 px-14 flex items-center justify-between backdrop-blur-xl border-b z-30 transition-all duration-300 sticky top-0"
        style={{
          backgroundColor: isDarkMode
            ? "rgba(31, 41, 55, 0.7)"
            : "rgba(255, 255, 255, 0.7)",
          borderColor: isDarkMode
            ? "rgba(75, 85, 99, 0.5)"
            : "rgba(229, 231, 235, 0.5)",
        }}
      >
        <div className="flex items-center gap-6">
          <motion.button
            onClick={handleNavigate}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
                group relative flex items-center justify-center w-8 h-8 rounded-full 
                transition-colors duration-300 border backdrop-blur-md cursor-pointer overflow-hidden
                ${isDarkMode ? "border-white/10 bg-white/10" : "border-black/5 bg-black/5"} 
              `}
            title="Назад"
          >
            <ChevronLeft
              size={15}
              strokeWidth={3}
              className={`relative z-10 transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-[#555f6e]"}`}
            />
          </motion.button>

          <div
            className={`h-6 w-[1px] rounded-full ml-3 ${
              isDarkMode ? "bg-white/10!" : "bg-black/10!"
            }`}
          />
          <div className="flex items-center gap-1">
            <NavButton
              icon={<InboxOutlined />}
              label="Входящие"
              active={activeNavRegistry === "inbox"}
              onClick={() =>
                setActiveNavRegistry(
                  activeNavRegistry === "inbox" ? null : "inbox",
                )
              }
              isDarkMode={isDarkMode}
            />
            <NavButton
              icon={<SendOutlined />}
              label="Отправленные"
              active={activeNavRegistry === "sent"}
              onClick={() =>
                setActiveNavRegistry(
                  activeNavRegistry === "sent" ? null : "sent",
                )
              }
              isDarkMode={isDarkMode}
            />
            <NavButton
              icon={<FileTextOutlined />}
              label="Черновики"
              active={activeNavRegistry === "drafts"}
              onClick={() =>
                setActiveNavRegistry(
                  activeNavRegistry === "drafts" ? null : "drafts",
                )
              }
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all cursor-pointer ${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`}
          >
            {isDarkMode ? (
              <SunOutlined className="text-[20px]" />
            ) : (
              <MoonOutlined className="text-[20px]" />
            )}
          </button>

          <div
            className="p-1.5 flex items-center justify-center rounded-lg transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
          >
            <div className="relative flex">
              <Avatar
                size={34}
                src={UserAvatar}
                alt="Аватар пользователя"
                className={`border shadow-sm ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 rounded-full ${isDarkMode ? "border-gray-800" : "border-white"}`}
              ></span>
            </div>
          </div>

          <Tooltip title="Выйти" placement="bottomRight">
            <button
              onClick={handleLogout}
              aria-label="Выход"
              className={`p-2 flex items-center justify-center rounded-lg transition-all cursor-pointer ${textSecondary} hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 focus:outline-none`}
            >
              <LogOut size={20} strokeWidth={2} />
            </button>
          </Tooltip>
        </div>
      </nav>

      <NavRegistryDropdown
        activeNavRegistry={activeNavRegistry}
        navRegistries={navRegistries}
        onClose={() => setActiveNavRegistry(null)}
        isDarkMode={isDarkMode}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        currentPreset={currentPreset}
      />
    </>
  );
};
