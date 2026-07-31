import React from "react";
import { TModalType, VISIBLE_ITEMS_LIMIT } from "./drawerActionsModalModel";
import { ActionSelector } from "./ActionSelector";
import { SelectedCard } from "./SelectedCard";
import { Icons, Ui } from "../lib";
import { If } from "@shared/ui";
import { ISearchItem } from "@shared/ui/SmartSearchModal";

interface OutgoingActionsSectionProps {
  isDarkMode?: boolean;
  isReadOnly?: boolean;
  selectedItems: ISearchItem[];
  selectedSigners: ISearchItem[];
  selectedApprovers: ISearchItem[];
  handleOpenModal: (type: TModalType) => void;
  handleRemoveItem: (id: string, type: string) => void;
  setViewAllSection: (section: string | null) => void;
  handleSave: () => void;
}

export const OutgoingActionsSection: React.FC<OutgoingActionsSectionProps> = ({
  isDarkMode,
  isReadOnly,
  selectedItems,
  selectedSigners,
  selectedApprovers,
  handleOpenModal,
  handleRemoveItem,
  setViewAllSection,
  handleSave,
}) => {
  const sections = [
    {
      id: "attach" as const,
      title: "Прикрепить письмо",
      icon: <Icons.MailOutlined />,
      label:
        selectedItems.length > 0
          ? `Выбрано писем: ${selectedItems.length}`
          : "Выбрать письмо",
      items: selectedItems,
    },
    {
      id: "signer" as const,
      title: "Подписывающий",
      icon: <Icons.UserOutlined />,
      label:
        selectedSigners.length > 0
          ? `Выбрано: ${selectedSigners.length}`
          : "Выбрать подписывающего",
      items: selectedSigners,
    },
    {
      id: "approvers" as const,
      title: "Согласующие",
      icon: <Icons.TeamOutlined />,
      label:
        selectedApprovers.length > 0
          ? `Выбрано: ${selectedApprovers.length}`
          : "Выбрать согласующих",
      items: selectedApprovers,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section) => {
        const visibleItems = section.items.slice(0, VISIBLE_ITEMS_LIMIT);
        const hiddenCount = section.items.length - VISIBLE_ITEMS_LIMIT;
        return (
          <div key={section.id} className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </h4>

            <ActionSelector
              icon={section.icon}
              label={section.label}
              onClick={() => handleOpenModal(section.id)}
              isDarkMode={isDarkMode}
            />

            <If is={section.items.length > 0}>
              <div className="flex flex-col gap-2">
                {visibleItems.map((item) => (
                  <SelectedCard
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    onRemove={() => handleRemoveItem(item.id, section.id)}
                    isDarkMode={isDarkMode}
                  />
                ))}
                <If is={hiddenCount > 0}>
                  <div
                    onClick={() => setViewAllSection(section.id)}
                    className={`py-2 px-3 text-center text-sm font-medium rounded-lg cursor-pointer transition-all border border-dashed ${
                      isDarkMode
                        ? "text-gray-400 bg-gray-800/50 hover:bg-gray-800 hover:text-gray-200 border-gray-700"
                        : "text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 border-gray-200"
                    }`}
                  >
                    Показать еще (+{hiddenCount})
                  </div>
                </If>
              </div>
            </If>
          </div>
        );
      })}

      <div>
        <Ui.Button
          onClick={handleSave}
          type="primary"
          className=" w-full!  p-5! font-bold! bg-[#FF6B6B]! hover:bg-[#ff5252]! text-white rounded-xl! transition-colors duration-200 flex items-center justify-center gap-2"
          disabled={isReadOnly}
        >
          Сохранить
        </Ui.Button>
      </div>
    </div>
  );
};
