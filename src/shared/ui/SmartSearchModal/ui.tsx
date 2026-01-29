import React, { useState, useMemo } from 'react';
import { Input, Button, Empty } from 'antd';
import { CloseOutlined,} from '@ant-design/icons';
import { ISmartSearchModalProps, ISelectionState, ISearchItem } from './model';
import { SearchPreviewPanel } from './ui/SearchPreviewPanel';
import { SearchListItem } from './ui/SearchListItem';
import { useGetQuery } from '@shared/lib/hooks';
import { Loader, If } from '@shared/ui';

export const SmartSearchUI: React.FC<ISmartSearchModalProps> = ({
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
        ...(mode === 'attach' 
            ? { subject: searchText, sender_name: searchText } 
            : { first_name: searchText }
        ),
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
        let newSelectedIds = prev.selectedIds;

        if (multiple) {
            const isSelected = prev.selectedIds.includes(item.id);
            if (!isSelected && prev.selectedIds.length >= 3) {
                return prev;
            }
            newSelectedIds = isSelected
                ? prev.selectedIds.filter(id => id !== item.id)
                : [...prev.selectedIds, item.id];
        } else {
             newSelectedIds = prev.selectedIds.includes(item.id) ? [] : [item.id];
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
    <div className="smart-search-content flex flex-col h-full bg-gray-50/30 rounded-3xl">
      <div className='mb-5'>
        <Input
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="min-h-14 max-h-14 rounded-2xl bg-white border-none! hover:bg-gray-50 focus:bg-white transition-all text-base shadow-sm w-full px-5"
        />
      </div>

      <div className="flex min-h-0 gap-3 mb-6">
        <If is={isExpanded}>
        <div className="flex-1 animate-in fade-in slide-in-from-left-4 duration-500  flex flex-col">
            <Button 
                icon={<CloseOutlined />}
                type='link'
                onClick={handleClosePreview} 
                className="flex text-xl! ml-auto! pr-3!"
            />
            <SearchPreviewPanel item={state.activePreviewItem} />
        </div>
        </If>
        
        <div className={`
            flex flex-col relative transition-all duration-500 ease-in-out
            ${isExpanded ? 'w-[440px]' : 'w-full'}
        `}>
            <If is={isLoading}>
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-[24px] overflow-hidden">
                    <Loader />
                </div>
            </If>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                {displayItems.length === 0 && !isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Empty description="Нет данных" />
                    </div>
                ) : (
                    displayItems.map((item: ISearchItem) => (
                        <SearchListItem 
                            key={item.id}
                            item={item}
                            isActive={state.activePreviewItem?.id === item.id}
                            isSelected={state.selectedIds.includes(item.id)}
                            onClick={handleItemClick}
                        />
                    ))
                )}
            </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-gray-400 text-sm font-medium whitespace-nowrap">
          Выбрано: <span className="text-[#8C52FF] ml-1">{state.selectedIds.length}</span>
        </div>

        <If is={mode === 'attach' && state.selectedIds.length > 0}>
            <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
                {state.selectedIds.map(id => {
                    const item = selectedItemsMap[id];
                    if (!item) return null;
                    const isActive = state.activePreviewItem?.id === id;
                    return (
                        <Button
                            key={id}
                            onClick={() => setState(prev => ({ ...prev, activePreviewItem: item }))}
                            className={`
                                px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                                ${isActive 
                                    ? 'bg-[#8C52FF] text-white border-[#8C52FF] shadow-sm' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-purple-200'
                                }
                            `}
                        >
                            {item.title}
                        </Button>
                    );
                })}
            </div>
        </If>

        <If is={!(mode === 'attach' && state.selectedIds.length > 0)}>
            <div className="flex-1" />
        </If>

        <Button
          size="large"
          disabled={state.selectedIds.length === 0}
          onClick={handleConfirmClick}
          className=" bg-[#8C52FF]! text-white! border-none! hover:bg-[#7a3eff]!"
        >
          Готово
        </Button>
      </div>
    </div>
  );
};