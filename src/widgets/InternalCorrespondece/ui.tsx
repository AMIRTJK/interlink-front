import { useModalState } from "@shared/lib";
import { ActionToolbar } from "@shared/ui";
import { DrawerActionsModal } from "@widgets/DrawerActionsModal";
import { TopNavigation } from "./ui/TopNavigation";
import { useState } from "react";

export const InternalCorrespondece = () => {
  // Извлекаем правильные имена из хука: open и close
  const { open, close, isOpen } = useModalState();

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Определяем классы для фона всей страницы
  const bgClass = isDarkMode
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
    : "bg-gradient-to-br from-white via-gray-50 to-white text-gray-900";

  return (
    <div className="relative min-h-screen">
      <TopNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <DrawerActionsModal open={isOpen} onClose={close} />
      <ActionToolbar
        setIsInspectorOpen={open}
        setShowPreview={() => console.log("Просмотр")}
        handleSend={() => console.log("Отправить")}
      />
    </div>
  );
};
