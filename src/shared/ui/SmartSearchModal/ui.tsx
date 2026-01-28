import React, { useState, useMemo } from 'react';
import { Input, Button, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ISmartSearchModalProps, ISelectionState, ISearchItem } from './model';
import { SearchPreviewPanel } from './ui/SearchPreviewPanel';
import { SearchListItem } from './ui/SearchListItem';
import { useGetQuery } from '@shared/lib/hooks';

export const SmartSearchUI: React.FC<ISmartSearchModalProps> = ({
  // title,
  placeholder = "Поиск по теме или отправителю...",
  items = [],
  querySettings,
  transformResponse,
  onConfirm,
  multiple = true,
  mode = 'attach'
}) => {
  const [state, setState] = useState<ISelectionState>({
    selectedIds: [],
    activePreviewItem: null,
  });
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, ISearchItem>>({});
  const [searchText, setSearchText] = useState('');
  const { data: fetchedData, isLoading } = useGetQuery<any, any>({
    url: querySettings?.url,
    params: {
        ...querySettings?.params,
        search: searchText ,
        page: 1,
        per_page: 50 
    },
    options: {
        enabled: !!querySettings?.url
    }
  });

  const displayItems = useMemo(() => {
    if (!querySettings?.url) return items;
    let rawItems: any[] = [];
    if (Array.isArray(fetchedData)) {
        rawItems = fetchedData;
    } else if (fetchedData) {
        if (Array.isArray(fetchedData.items)) rawItems = fetchedData.items;
        else if (Array.isArray(fetchedData.data)) rawItems = fetchedData.data;
        else if (fetchedData.data && Array.isArray(fetchedData.data.items)) rawItems = fetchedData.data.items;
        else if (fetchedData.data && Array.isArray(fetchedData.data.data)) rawItems = fetchedData.data.data; // Handle pagination wrapper
    }
    
    if (transformResponse) {
        return transformResponse(rawItems);
    }
    return rawItems;
  }, [querySettings?.url, fetchedData, items, transformResponse]);
  const isExpanded = mode === 'attach' && !!state.activePreviewItem;
  const handleItemClick = (item: ISearchItem) => {
    setSelectedItemsMap(prev => {
        const newMap = { ...prev };
        if (!multiple) {
            return newMap[item.id] ? {} : { [item.id]: item };
        }
        if (newMap[item.id]) {
            delete newMap[item.id];
        } else {
            newMap[item.id] = item;
        }
        return newMap;
    });

    setState(prev => {
        const isSelected = prev.selectedIds.includes(item.id);
        let newSelectedIds = prev.selectedIds;

        if (multiple) {
            newSelectedIds = isSelected
                ? prev.selectedIds.filter(id => id !== item.id)
                : [...prev.selectedIds, item.id];
        } else {
             newSelectedIds = isSelected ? [] : [item.id];
        }
        
        return {
            ...prev,
            activePreviewItem: mode === 'attach' ? item : null, 
            selectedIds: newSelectedIds
        };
    });
  };

  const handleConfirmClick = () => {
    const selectedItems = state.selectedIds.map(id => selectedItemsMap[id]).filter(Boolean);
    onConfirm(state.selectedIds, selectedItems);
  };
  
  const handleClosePreview = () => {
      setState(prev => ({ ...prev, activePreviewItem: null }));
  };

  return (
    <div className="smart-search-content flex flex-col h-full bg-white rounded-3xl p-6">
      <div className="mb-6">
        <Input
          prefix={<SearchOutlined className="text-gray-400 mr-2" />}
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="h-14 rounded-2xl bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all text-base shadow-sm w-full"
        />
      </div>

      <div className="flex gap-6 flex-1 min-h-0 relative">
        {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
                <Spin size="large" />
            </div>
        ) : displayItems.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
                <Empty description="Нет данных" />
            </div>
        ) : (
            <>
                {isExpanded && (
                <div className="flex-1 animate-in fade-in slide-in-from-left-4 duration-500">
                    <SearchPreviewPanel item={state.activePreviewItem} />
                </div>
                )}
                
                <div className={`
                    flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300
                    ${isExpanded ? 'w-[440px]' : 'w-full'}
                `}>
                    {displayItems.map((item: ISearchItem) => (
                        <SearchListItem 
                        key={item.id}
                        item={item}
                        isActive={state.activePreviewItem?.id === item.id}
                        isSelected={state.selectedIds.includes(item.id)}
                        onClick={handleItemClick}
                        />
                    ))}
                </div>
            </>
        )}
      </div>
      <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center bg-white">
        <div className="text-gray-400 text-sm font-medium">
          Выбрано: <span className="text-purple-500 ml-1">{state.selectedIds.length}</span>
        </div>
        <Button
          type="primary"
          size="large"
          disabled={state.selectedIds.length === 0}
          onClick={handleConfirmClick}
          className="rounded-2xl px-12 h-12 bg-[#8C52FF] hover:bg-[#7a3eff]! border-none shadow-lg shadow-purple-100 font-bold transition-all"
        >
          Готово
        </Button>
      </div>
    </div>
  );
};