import { useMemo, useState } from "react";
import { useGetQuery } from "@shared/lib/hooks";
import { ISmartSearchModalProps, ISelectionState, ISearchItem } from "./model";

export const useSmartSearchState = (props: ISmartSearchModalProps) => {
  const {
    items = [],
    querySettings,
    transformResponse,
    onConfirm,
    multiple = true,
    mode = "attach",
  } = props;

  const [state, setState] = useState<ISelectionState>({
    selectedIds: [],
    activePreviewItem: null,
  });

  const [selectedItemsMap, setSelectedItemsMap] = useState<
    Record<string, ISearchItem>
  >({});
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data: fetchedData, isLoading } = useGetQuery<any, any>({
    url: querySettings?.url,
    params: {
      ...querySettings?.params,
      ...(mode === "attach" ? { q: searchText } : { search: searchText }),
      page: 1,
      per_page: 50,
    },
    options: {
      enabled: !!querySettings?.url,
    },
  });

  const displayItems = useMemo(() => {
    if (!querySettings?.url) return items;
    let rawItems: any[] = [];
    if (Array.isArray(fetchedData)) {
      rawItems = fetchedData;
    } else if (fetchedData) {
      const data = fetchedData as any;
      if (Array.isArray(data.items)) rawItems = data.items;
      else if (Array.isArray(data.data)) rawItems = data.data;
      else if (data.data && Array.isArray(data.data.items))
        rawItems = data.data.items;
      else if (data.data && Array.isArray(data.data.data))
        rawItems = data.data.data;
    }

    if (transformResponse) {
      return transformResponse(rawItems);
    }
    return rawItems;
  }, [querySettings?.url, fetchedData, items, transformResponse]);

  const isExpanded = mode === "attach" && !!state.activePreviewItem;

  const handleItemClick = (item: ISearchItem) => {
    setSelectedItemsMap((prev) => {
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

    setState((prev) => {
      let newSelectedIds = prev.selectedIds;

      if (multiple) {
        const isSelected = prev.selectedIds.includes(item.id);
        newSelectedIds = isSelected
          ? prev.selectedIds.filter((id) => id !== item.id)
          : [...prev.selectedIds, item.id];
      } else {
        newSelectedIds = prev.selectedIds.includes(item.id) ? [] : [item.id];
      }

      return {
        ...prev,
        activePreviewItem: mode === "attach" ? item : null,
        selectedIds: newSelectedIds,
      };
    });
  };

  const handleConfirmClick = () => {
    const selectedItems = state.selectedIds
      .map((id) => selectedItemsMap[id])
      .filter(Boolean);
    onConfirm(state.selectedIds, selectedItems);
    setState({
      selectedIds: [],
      activePreviewItem: null,
    });
    setSelectedItemsMap({});
    setSearchText("");
  };

  const handleClosePreview = () => {
    setState((prev) => ({ ...prev, activePreviewItem: null }));
  };

  const setActivePreview = (item: ISearchItem) => {
    setState((prev) => ({ ...prev, activePreviewItem: item }));
  };

  return {
    state,
    selectedItemsMap,
    searchText,
    setSearchText,
    isSearchFocused,
    setIsSearchFocused,
    isLoading,
    displayItems,
    isExpanded,
    handleItemClick,
    handleConfirmClick,
    handleClosePreview,
    setActivePreview,
  };
};
