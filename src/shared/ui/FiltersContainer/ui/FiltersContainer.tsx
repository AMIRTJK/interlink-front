import { FC, useState } from "react";
import { FilterType, IFilterItem } from "../model";
import { FilterInput } from "./FilterInput";
import { FilterSelect } from "./FilterSelect";
import { FilterDate } from "./FilterDate";
import { Form, FormInstance, ConfigProvider, Button as ButtonAntd } from "antd";
import { Button } from "@shared/ui";
import { FilterOutlined, SyncOutlined } from "@ant-design/icons";
import FilterSettingsIcon from "../../../../assets/icons/filter-settings-icon.svg";

interface IProps {
  filters: IFilterItem[];
  onSearch: (filters: Record<string, any>) => void;
  onReset: () => void;
  form: FormInstance;
}

export const FiltersContainer: FC<IProps> = ({
  filters,
  onSearch,
  onReset,
  form,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const themeToken = {
    borderRadius: 8,
    controlHeight: 40,
    componentDisabledBg: "white",
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const renderFilter = (filter: IFilterItem) => {
    switch (filter.type) {
      case FilterType.INPUT:
        return <FilterInput key={filter.name} config={filter} />;
      case FilterType.SELECT:
        return <FilterSelect key={filter.name} config={filter} />;
      case FilterType.DATE:
        return <FilterDate key={filter.name} config={filter} />;
      default:
        return null;
    }
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
              Select: { selectorBg: "white" },
              Input: { activeBorderColor: "#ffffff" },
              DatePicker: { controlHeight: 40 },
            },
          }}
        >
          <Form form={form} className="flex items-center gap-2">
            <div
              className="grid gap-2 flex-grow"
              style={{
                // Сетка адаптируется под количество фильтров + 1 (для кнопки сброса)
                gridTemplateColumns: `repeat(${filters.length + 1}, minmax(0, 1fr))`,
              }}
            >
              {filters.map(renderFilter)}

              {/* Кнопка Сброса внутри сетки */}
              <ButtonAntd
                type="default"
                onClick={handleReset}
                className="w-full! h-10! bg-transparent! border-white/40! text-white! hover:bg-white/10! flex items-center justify-center gap-2 rounded-lg!"
              >
                <SyncOutlined className="text-xs" />
                Сбросить
              </ButtonAntd>
            </div>

            {/* Иконка настроек в конце */}
            <Button
              type="default"
              className="flex! items-center! justify-center! h-10! w-10! p-0! shrink-0! border-white/50! bg-transparent! hover:bg-white/10!"
              icon={FilterSettingsIcon}
              withIcon
            />
          </Form>
        </ConfigProvider>
      )}
    </div>
  );
};
