import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { AppRoutes } from "@shared/config";
import { CorrespondenceResponse } from "@entities/correspondence";

interface IParams {
  type: string;
  extraParams?: Record<string, unknown>;
}

export const useRegistryTableState = ({ type, extraParams }: IParams) => {
  const tabFromParams = extraParams?.tab;

  const defaultTab = type === "internal-incoming" ? "analysis" : "";

  const initialTab =
    typeof tabFromParams === "string" ? tabFromParams : defaultTab;

  const [currentTab, setCurrentTab] = useState(initialTab);
  const [correspondenceId, setCorrespondenceId] = useState<string | number>();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folderId");

  const isDefaultFolder = !!searchParams.get("defaultFolder");

  const customTabs = useMemo(() => {
    if (type === "internal-incoming") {
      return [];
    }
    if (type === "internal-outgoing") {
      return [];
    }
    if (type === "internal-drafts") {
      // return INTERNAL_OUTGOING_TABS;
    }
    return undefined;
  }, [type]);

  const showCreateButton =
    (type.includes("incoming") || type.includes("outgoing")) &&
    !folderId &&
    !isDefaultFolder &&
    !type.includes("drafts") &&
    !type.includes("archive");

  const handleCreate = () => {
    navigate(`${location.pathname}/create`);
  };

  const [folderModalRecordId, setFolderModalRecordId] = useState<number | null>(null);

  const { data: isAllowed, isPending } = useGetQuery({
    preload: true,
    preloadConditional: ["correspondence.create", "correspondence.view"],
  });

  const { data: countersData } = useGetQuery({
    url: ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
    params: extraParams?.kind ? { kind: extraParams.kind } : {},
  });

  const tabCounts = useMemo(
    () => (countersData as Record<string, any>)?.data || {},
    [countersData],
  );

  const { data: foldersData } = useGetQuery({
    url: type.includes("internal") ? ApiRoutes.GET_INTERNAL_FOLDERS : ApiRoutes.GET_FOLDERS,
  });

  const folders = useMemo(() => {
    const apiData = (foldersData as any)?.data;
    if (apiData && typeof apiData === "object" && !Array.isArray(apiData)) {
      return apiData.custom_flat || [];
    }
    return Array.isArray(apiData) ? apiData : [];
  }, [foldersData]);

  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

  const showExpandRow = type.includes("internal");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleGetIdCorrespondence = (record: CorrespondenceResponse) => {
    setCorrespondenceId(record.id);
  };

  useEffect(() => {
    if (location.state && (location.state as any).openBookModal) {
      setIsModalOpen(true);
      if ((location.state as any).savedCorrespondenceId) {
        setCorrespondenceId((location.state as any).savedCorrespondenceId);
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNavigateToExecution = (fromModal = false) => {
    navigate(
      AppRoutes.CORRESPONDENCE_INCOMING_SHOW.replace(
        ":id",
        String(correspondenceId),
      ),
      {
        state: {
          openExecution: true,
          returnToBookModal: fromModal,
          previousPath: location.pathname + location.search,
          savedCorrespondenceId: correspondenceId,
        },
      },
    );
  };

  const handleNavigateToLetter = (record: CorrespondenceResponse) => {
    console.log(type);

    const route = type.includes("external-incoming")
      ? AppRoutes.CORRESPONDENCE_INCOMING_SHOW
      : type.includes("internal-incoming")
        ? AppRoutes.INTERNAL_INCOMING_SHOW
        : type.includes("internal-outgoing") ||
            type.includes("internal-drafts") ||
            type.includes("internal-to-sign") ||
            type.includes("internal-to-approve")
          ? AppRoutes.INTERNAL_OUTGOING_SHOW
          : "";

    navigate(route.replace(":id", String(record.id)));
  };

  const showTabs = Array.isArray(customTabs)
    ? customTabs.length > 0
    : !!extraParams?.kind;

  return {
    currentTab,
    setCurrentTab,
    customTabs,
    showTabs,
    tabCounts,
    showCreateButton,
    handleCreate,
    isAllowed,
    isPending,
    folders,
    folderModalRecordId,
    setFolderModalRecordId,
    expandedRowKeys,
    setExpandedRowKeys,
    showExpandRow,
    isModalOpen,
    setIsModalOpen,
    handleOpenModal,
    handleGetIdCorrespondence,
    handleNavigateToExecution,
    handleNavigateToLetter,
  };
};
