import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Filter, ChevronDown, User, Mail, Search, Calendar } from "lucide-react";
import { DatePicker, Input, Select } from "antd";

const getIcon = (name: string) => {
  const iconClass = "w-4 h-4 text-blue-200/60 mr-1";
  if (name.toLowerCase().includes("incoming"))
    return <Mail className={iconClass} />;
  if (name.toLowerCase().includes("outgoing"))
    return <Search className={iconClass} />;
  if (name.toLowerCase().includes("sender"))
    return <User className={iconClass} />;
  return <Filter className={iconClass} />;
};

interface IProps {
  item: any;
  localFilters: any;
  onChange: (key: string, value: any) => void;
  setLocalFilters: (updater: (prev: any) => any) => void;
}

/** Одно поле фильтра: текст, выпадающий список, дата или диапазон дат. */
export const FilterField = ({
  item,
  localFilters,
  onChange,
  setLocalFilters,
}: IProps) => {
  const isDate = item.type === "date";
  const isDateRange =
    item.type === "date_range" || item.type === "date-range";
  const isSelect = item.type === "select";
  const isInput = item.type === "input" || !item.type;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 50 },
        show: { opacity: 1, x: 0 },
      }}
    >
      <label className="text-white/80 text-sm font-medium mb-2 block">
        {item.label}
      </label>

      {isInput && (
        <Input
          placeholder={item.placeholder}
          prefix={getIcon(item.name)}
          value={localFilters[item.name]} // undefined сбросит поле
          onChange={(e) => onChange(item.name, e.target.value)}
          allowClear
          className="backdrop-blur-sm [&_input::placeholder]:text-blue-100/50! [&_input::placeholder]:text-sm! transition-colors! focus-within:shadow-none! focus-within:border-[#e8e8e8]!"
        />
      )}

      {isSelect && (
        <Select
          placeholder={item.placeholder}
          value={localFilters[item.name] || undefined} // undefined для сброса
          onChange={(val) => onChange(item.name, val)}
          options={item.options}
          allowClear
          className="w-full backdrop-blur-sm [--ant-select-active-outline-color:transparent]!"
          suffixIcon={<ChevronDown className="w-4 h-4 text-white/60" />}
        />
      )}

      {isDate && (
        <DatePicker
          className="w-full backdrop-blur-sm [&.ant-picker-focused]:border-[#e8e8e8]! [&.ant-picker-focused]:shadow-none!"
          placeholder={item.placeholder}
          value={
            localFilters[item.name]
              ? dayjs(localFilters[item.name])
              : null // null сбросит поле
          }
          onChange={
            (date, dateString) => onChange(item.name, dateString) // dateString будет пустой строкой при очистке
          }
          suffixIcon={<Calendar className="w-4 h-4 text-blue-200/60" />}
        />
      )}

      {isDateRange && (
        <DatePicker.RangePicker
          className="w-full backdrop-blur-sm [&.ant-picker-focused]:border-[#e8e8e8]! [&.ant-picker-focused]:shadow-none!"
          placeholder={
            Array.isArray(item.placeholder)
              ? item.placeholder
              : ["С даты", "По дату"]
          }
          value={
            localFilters[item.rangeNames?.[0]] &&
            localFilters[item.rangeNames?.[1]]
              ? [
                  dayjs(localFilters[item.rangeNames[0]]),
                  dayjs(localFilters[item.rangeNames[1]]),
                ]
              : null // Сброс при отсутствии дат
          }
          onChange={(dates, dateStrings) => {
            if (item.rangeNames) {
              setLocalFilters((prev: any) => {
                const next = { ...prev };
                if (!dates) {
                  // Сброс
                  delete next[item.rangeNames[0]];
                  delete next[item.rangeNames[1]];
                } else {
                  next[item.rangeNames[0]] = dateStrings[0];
                  next[item.rangeNames[1]] = dateStrings[1];
                }
                return next;
              });
            }
          }}
          suffixIcon={<Calendar className="w-4 h-4 text-blue-200/60" />}
          separator={<span className="text-white/40">→</span>}
          allowClear
        />
      )}
    </motion.div>
  );
};
