import React, { useState, useMemo } from 'react';
import { Dropdown, MenuProps, Spin } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useGetQuery } from "@shared/lib"; 
import './style.css'
interface ISmartDropDownProps {
  url: string;
  placeholder: string;
  icon: React.ReactNode;
  onSelect?: (value: any) => void;
  transformResponse?: (data: any) => { value: string | number; label: string }[];
}

export const SmartDropDown: React.FC<ISmartDropDownProps> = ({
  url,
  placeholder,
  icon,
  onSelect,
  transformResponse,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const { data, isFetching } = useGetQuery({
    url,
    method: "GET",
    useToken: true,
    options: {
      enabled: isOpen, 
      staleTime: 1000 * 60 * 5, 
    },
  });

  const options = useMemo(() => {
    if (!data) return [];
    if (transformResponse) return transformResponse(data);
    const list = data?.items || data?.data || (Array.isArray(data) ? data : []);
    return list.map((item: any) => ({
      value: item.id,
      label: item.name || item.title || item.label,
    }));
  }, [data, transformResponse]);

  const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    const item = options.find((opt: any) => String(opt.value) === key);
    if (item) {
      setSelectedLabel(item.label);
      onSelect?.(item.value);
    }
    setIsOpen(false);
  };

  const menuItems: MenuProps['items'] = useMemo(() => {
    if (isFetching) return [{ key: 'loading', label: <Spin size="small" />, disabled: true }];
    if (options.length === 0) return [{ key: 'empty', label: 'Нет данных', disabled: true }];
    return options.map((opt: any) => ({ key: String(opt.value), label: opt.label }));
  }, [options, isFetching]);

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={['click']}
      open={isOpen}
      onOpenChange={setIsOpen}
      // Применяем анимацию появления к самому выпадающему меню
      overlayClassName="drawer__content--animate"
    >
      <div className="
        drawer__content--animate
        group flex items-center justify-between 
        bg-white p-4 rounded-2xl cursor-pointer 
        hover:shadow-lg hover:shadow-gray-100 
        transition-all duration-300
        border border-transparent hover:border-red-100
      ">
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-lg text-gray-400 group-hover:text-[#F87171] transition-colors">
            {icon}
          </span>
          <span className="font-medium text-sm text-gray-700">
            {selectedLabel || placeholder}
          </span>
        </div>
        
        <RightOutlined 
          className={`text-gray-300 text-[10px] transition-all duration-300 
            group-hover:translate-x-1 
            ${isOpen ? 'rotate-90' : 'rotate-0'}
          `} 
        />
      </div>
    </Dropdown>
  );
};