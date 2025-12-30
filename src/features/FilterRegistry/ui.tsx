import { useState } from "react";
import { Input, Select, DatePicker, ConfigProvider, Space } from "antd";
import {
  FilterOutlined,
  SettingOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import FilterSettingsIcon from "../../assets/icons/filter-settings-icon.svg";
import { Button } from "@shared/ui";

export const FilterRegistry = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Стилизация Antd под дизайн на скриншоте
  const themeToken = {
    componentDisabledBg: "white",
    borderRadius: 8,
    controlHeight: 40,
  };

  return (
    <div className="bg-[#0037AF] rounded-xl p-3 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-white">
          <FilterOutlined />
          <span className="text-sm font-medium">Фильтр</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors cursor-pointer"
        >
          {collapsed ? "Показать" : "Скрыть"}
        </button>
      </div>

      {!collapsed && (
        <ConfigProvider
          theme={{
            token: themeToken,
            components: {
              Select: {
                selectorBg: "white",
                optionSelectedBg: "#e6f4ff",
              },
            },
          }}
        >
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-5 gap-2 flex-grow">
              <Input placeholder="Исходящий номер" />
              <Input placeholder="Входящий номер" />
              <DatePicker
                placeholder="Дата"
                className="w-full"
                format="DD.MM.YYYY"
              />
              <Select
                placeholder="Отправитель"
                options={[
                  { value: "1", label: "Организация 1" },
                  { value: "2", label: "Организация 2" },
                ]}
              />
              <Select
                placeholder="Статус"
                options={[
                  { value: "sent", label: "Отправлено" },
                  { value: "pending", label: "В ожидании" },
                ]}
              />
            </div>

            {/* Кнопка настроек в стиле скриншота */}
            <Button
              type="default"
              className="flex! items-center! justify-center! h-9! w-9! p-0! flex-shrink-0! border-white/50! bg-transparent! hover:bg-white/10!"
              icon={FilterSettingsIcon}
              withIcon
            />
          </div>
        </ConfigProvider>
      )}
    </div>
  );
};
