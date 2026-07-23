import { useMemo, useState } from "react";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IApiFile, IApiFolder, IDiskMeta } from "./lib";
import { useFilesMutations } from "./useFilesMutations";

const COUNT_FETCH_SIZE = 100;

const buildFolderFileCounts = (items: IApiFile[]): Record<number, number> =>
  items.reduce<Record<number, number>>((acc, file) => {
    if (file.folder_id != null) {
      acc[file.folder_id] = (acc[file.folder_id] ?? 0) + 1;
    }
    return acc;
  }, {});

interface IFilesParams {
  search?: string;
  sort?: "name" | "date" | "size" | "manual";
  dir?: "asc" | "desc";
  activeFolderId?: number | "all";
  page?: number;
}

interface IFilesPaginatedData {
  current_page: number;
  data: IApiFile[];
  last_page: number;
  per_page: number;
  total: number;
}

export const useFilesData = (params: IFilesParams) => {
  const [manualOrderMap, setManualOrderMap] = useState<Record<number, number>>({});
  const mutations = useFilesMutations(setManualOrderMap);

  const memoizedParams = useMemo(
    () => ({
      search: params.search ?? "",
      sort: params.sort ?? "manual",
      dir: params.dir ?? "desc",
      activeFolderId: params.activeFolderId ?? "all",
      page: params.page ?? 1,
    }),
    [params.search, params.sort, params.dir, params.activeFolderId, params.page],
  );

  const countParams = useMemo(() => ({ per_page: COUNT_FETCH_SIZE }), []);

  const personalFilesParams = useMemo(() => {
    const { activeFolderId: personalFolderId, ...baseParams } = memoizedParams;
    return {
      ...baseParams,
      ...(typeof personalFolderId === "number" ? { folder_id: personalFolderId } : {}),
    };
  }, [memoizedParams]);

  const sharedFilesParams = useMemo(() => {
    const { activeFolderId: sharedFolderId, ...sharedBaseParams } = memoizedParams;
    return {
      ...sharedBaseParams,
      ...(typeof sharedFolderId === "number" ? { folder_id: sharedFolderId } : {}),
    };
  }, [memoizedParams]);

  const cacheOptions = useMemo(
    () => ({
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    }),
    [],
  );

  const filesQuery = useGetQuery<typeof personalFilesParams, { success: boolean; data: IFilesPaginatedData }>({
    url: ApiRoutes.MY_FILES,
    params: personalFilesParams,
    useToken: true,
    options: cacheOptions,
  });

  const foldersQuery = useGetQuery<any, { success: boolean; data: IApiFolder[] }>({
    url: ApiRoutes.MY_FILE_FOLDERS,
    useToken: true,
    options: cacheOptions,
  });

  const metaQuery = useGetQuery<any, { success: boolean; data: IDiskMeta }>({
    url: ApiRoutes.MY_FILES_META,
    useToken: true,
    options: cacheOptions,
  });

  const filesCountQuery = useGetQuery<{ per_page: number }, { success: boolean; data: IFilesPaginatedData }>({
    url: ApiRoutes.MY_FILES,
    params: countParams,
    useToken: true,
    options: cacheOptions,
  });

  const sharedFilesQuery = useGetQuery<typeof sharedFilesParams, { success: boolean; data: { data: IApiFile[]; current_page?: number; total?: number; per_page?: number } }>({
    url: ApiRoutes.MY_FILES_SHARED_WITH_ME,
    params: sharedFilesParams,
    useToken: true,
    options: cacheOptions,
  });

  const sharedFoldersQuery = useGetQuery<any, { success: boolean; data: IApiFolder[] }>({
    url: ApiRoutes.MY_FILE_FOLDERS_SHARED_WITH_ME,
    useToken: true,
    options: cacheOptions,
  });

  const sharedFilesCountQuery = useGetQuery<{ per_page: number }, { success: boolean; data: { data: IApiFile[]; total?: number } }>({
    url: ApiRoutes.MY_FILES_SHARED_WITH_ME,
    params: countParams,
    useToken: true,
    options: cacheOptions,
  });

  const getArrayData = (response: any): any[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    return [];
  };

  const sortByManualOrder = <T extends { id?: number; sort_order?: number }>(arr: T[]): T[] => {
    if (params.sort && params.sort !== "manual") return arr;
    return [...arr].sort((a, b) => {
      const orderA = a.id != null && manualOrderMap[a.id] !== undefined ? manualOrderMap[a.id] : (a.sort_order ?? 0);
      const orderB = b.id != null && manualOrderMap[b.id] !== undefined ? manualOrderMap[b.id] : (b.sort_order ?? 0);
      return orderA - orderB;
    });
  };

  const folders = getArrayData(foldersQuery.data?.data);
  const rawFilesData = filesQuery.data?.data;
  const files: IApiFile[] = Array.isArray(rawFilesData)
    ? rawFilesData
    : rawFilesData?.data ?? [];

  const filesPagination = {
    total: rawFilesData?.total ?? 0,
    currentPage: rawFilesData?.current_page ?? 1,
    perPage: rawFilesData?.per_page ?? 30,
  };

  const rawSharedFilesData = sharedFilesQuery.data?.data;
  const sharedFiles = useMemo(
    () => sortByManualOrder(getArrayData(rawSharedFilesData)),
    [rawSharedFilesData, params.sort, params.dir, manualOrderMap],
  );
  const sharedFolders = getArrayData(sharedFoldersQuery.data?.data);

  const sharedFilesPagination = {
    total: rawSharedFilesData?.total ?? 0,
    currentPage: rawSharedFilesData?.current_page ?? 1,
    perPage: rawSharedFilesData?.per_page ?? 30,
  };

  const allFilesList = useMemo(
    () => getArrayData(filesCountQuery.data?.data),
    [filesCountQuery.data],
  );
  const folderFileCounts = useMemo(() => buildFolderFileCounts(allFilesList), [allFilesList]);

  const calculatedTotalFromFolders = useMemo(() => {
    const foldersCount = folders.reduce((sum, f) => {
      const cnt = f.files_count ?? folderFileCounts[f.id] ?? 0;
      return sum + cnt;
    }, 0);
    const rootCount = allFilesList.filter((f) => f.folder_id === null).length;
    return foldersCount + rootCount;
  }, [folders, folderFileCounts, allFilesList]);

  const allFilesCount = useMemo(() => {
    const backendTotal = filesCountQuery.data?.data?.total;
    const metaTotal = metaQuery.data?.data?.total_count;
    return Math.max(
      backendTotal ?? 0,
      metaTotal ?? 0,
      allFilesList.length,
      files.length,
      calculatedTotalFromFolders,
    );
  }, [filesCountQuery.data, metaQuery.data, allFilesList, files, calculatedTotalFromFolders]);

  const allSharedFilesList = useMemo(
    () => getArrayData(sharedFilesCountQuery.data?.data),
    [sharedFilesCountQuery.data],
  );
  const sharedFolderFileCounts = useMemo(
    () => buildFolderFileCounts(allSharedFilesList),
    [allSharedFilesList],
  );

  const calculatedSharedTotalFromFolders = useMemo(() => {
    const foldersCount = sharedFolders.reduce((sum, f) => {
      const cnt = f.files_count ?? sharedFolderFileCounts[f.id] ?? 0;
      return sum + cnt;
    }, 0);
    const rootCount = allSharedFilesList.filter((f) => f.folder_id === null).length;
    return foldersCount + rootCount;
  }, [sharedFolders, sharedFolderFileCounts, allSharedFilesList]);

  const allSharedFilesCount = useMemo(() => {
    const backendTotal = sharedFilesCountQuery.data?.data?.total;
    return Math.max(
      backendTotal ?? 0,
      allSharedFilesList.length,
      sharedFiles.length,
      calculatedSharedTotalFromFolders,
    );
  }, [sharedFilesCountQuery.data, allSharedFilesList, sharedFiles, calculatedSharedTotalFromFolders]);

  const getFolderIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("рабоч")) return "💼";
    if (n.includes("документ")) return "📄";
    if (n.includes("договор")) return "📑";
    if (n.includes("фото") || n.includes("изображ")) return "🖼️";
    return "📁";
  };

  const categoriesList = useMemo(() => {
    const list: { id: number | "all"; name: string; icon: string; count: number }[] = [];
    list.push({ id: "all" as const, name: "Все файлы", icon: "📁", count: allFilesCount });
    folders.forEach((f) => {
      list.push({
        id: f.id,
        name: f.name,
        icon: f.emoji || getFolderIcon(f.name),
        count: f.files_count ?? folderFileCounts[f.id] ?? 0,
      });
    });
    return list;
  }, [folders, allFilesCount, folderFileCounts]);

  const sharedCategoriesList = useMemo(() => {
    const list: { id: number | "all"; name: string; icon: string; count: number }[] = [];
    list.push({ id: "all" as const, name: "Все общие файлы", icon: "🤝", count: allSharedFilesCount });
    sharedFolders.forEach((f) => {
      list.push({
        id: f.id,
        name: f.name,
        icon: f.emoji || getFolderIcon(f.name),
        count: f.files_count ?? sharedFolderFileCounts[f.id] ?? 0,
      });
    });
    return list;
  }, [sharedFolders, allSharedFilesCount, sharedFolderFileCounts]);

  const activeCategoryId = useMemo((): number | "all" => {
    const actId = params.activeFolderId;
    if (actId === undefined || actId === "all") return "all";
    return actId;
  }, [params.activeFolderId]);

  const pinnedFiles = useMemo(() => {
    return sortByManualOrder(files.filter((f) => f.is_starred));
  }, [files, params.sort, params.dir, manualOrderMap]);

  const currentFiles = useMemo(() => {
    const actId = params.activeFolderId;
    if (actId === undefined || actId === "all") {
      return sortByManualOrder(files);
    }
    const filtered = files.filter(
      (f) => f.folder_id !== null && Number(f.folder_id) === Number(actId),
    );
    return sortByManualOrder(filtered);
  }, [files, params.activeFolderId, params.sort, params.dir, manualOrderMap]);

  const currentFolders = useMemo(() => {
    const actId = params.activeFolderId;
    const parentId = actId === undefined || actId === "all" ? null : actId;
    if (parentId === null) return [];
    return folders.filter((f) => f.parent_id !== null && Number(f.parent_id) === Number(parentId));
  }, [folders, params.activeFolderId]);

  return {
    files,
    filesPagination,
    isLoadingFiles: filesQuery.isLoading,
    refetchFiles: filesQuery.refetch,

    folders,
    isLoadingFolders: foldersQuery.isLoading,
    refetchFolders: foldersQuery.refetch,

    meta: metaQuery.data?.data || null,
    isLoadingMeta: metaQuery.isLoading,
    refetchMeta: metaQuery.refetch,

    categoriesList,
    sharedCategoriesList,
    activeCategoryId,
    pinnedFiles,
    currentFiles,
    currentFolders,

    sharedFiles,
    sharedFilesPagination,
    isLoadingSharedFiles: sharedFilesQuery.isLoading,
    refetchSharedFiles: sharedFilesQuery.refetch,

    sharedFolders,
    isLoadingSharedFolders: sharedFoldersQuery.isLoading,
    refetchSharedFolders: sharedFoldersQuery.refetch,

    ...mutations,
  };
};
