import React from "react";
import { ConfigProvider, theme } from "antd";
import { Ui } from "../lib";
import { SelectedCard } from "./SelectedCard";
import { ISearchItem } from "@shared/ui/SmartSearchModal";

interface ViewAllModalProps {
  viewAllSection: string | null;
  viewAllItems: ISearchItem[];
  isDarkMode?: boolean;
  onClose: () => void;
  onRemoveItem: (id: string, section: string) => void;
}

export const ViewAllModal: React.FC<ViewAllModalProps> = ({
  viewAllSection,
  viewAllItems,
  isDarkMode,
  onClose,
  onRemoveItem,
}) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Ui.Modal
        open={!!viewAllSection}
        onCancel={onClose}
        footer={null}
        title="Выбранные элементы"
        width={500}
        centered
        zIndex={1200}
      >
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
          {viewAllItems.map((item) => (
            <SelectedCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              onRemove={() => {
                if (viewAllSection) {
                  onRemoveItem(item.id, viewAllSection);
                }
              }}
              isDarkMode={isDarkMode}
            />
          ))}
          {viewAllItems.length === 0 && (
            <div className="text-center text-gray-400 py-5">Список пуст</div>
          )}
        </div>
      </Ui.Modal>
    </ConfigProvider>
  );
};
