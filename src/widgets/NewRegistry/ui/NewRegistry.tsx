import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetQuery, useDynamicSearchParams, sortCorrespondenceById } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { ConfigProvider, theme } from "antd";
import { RegistryLayout } from "./RegistryLayout";
import { useRegistryConfig } from "../lib";
import { MoveToFolderModal } from "./MoveToFolderModal";
import { useIsDarkMode } from "@shared/lib";
import {
	STATUS_CONFIG,
	REGISTRY_STATUS_MAP,
	type NewRegistryProps,
} from "./newRegistry/newRegistryModel";
import { useRegistryBreadcrumbs } from "./newRegistry/useRegistryBreadcrumbs";
import { useRegistryStatusTabs } from "./newRegistry/useRegistryStatusTabs";
import { buildRegistryQueryParams } from "./newRegistry/registryQueryParams";
import { getRegistryShowRoute } from "./newRegistry/registryShowRoute";
import { REJECTED_TAB_KEY, REJECTION_TYPE_PARAM } from "../model";

export const NewRegistry = ({
	type,
	createButtonText,
	url = ApiRoutes.GET_CORRESPONDENCES,
	extraParams,
}: NewRegistryProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const isDark = useIsDarkMode();

	const { params: searchParams, setParams } = useDynamicSearchParams();

	const [isMoveModalOpen, setIsMoveModalOpen] = React.useState(false);
	const [movingDocId, setMovingDocId] = React.useState<number | null>(null);

	const handleOpenMoveModal = React.useCallback((id: number) => {
		setMovingDocId(id);
		setIsMoveModalOpen(true);
	}, []);

	const isInternal = type.startsWith("internal");

	const activeStatusKeys = useMemo(() => {
		if (type.includes("incoming")) return REGISTRY_STATUS_MAP["incoming"];
		if (type.includes("outgoing")) return REGISTRY_STATUS_MAP["outgoing"];
		return REGISTRY_STATUS_MAP["default"];
	}, [type]);

	const defaultStatus = useMemo(() => {
		if (searchParams.folder_id) return "";
		if (type === "internal-incoming") return "analysis";
		if (type === "internal-outgoing") return "sent";
		if (type === "internal-drafts") return "draft";
		if (type === "internal-to-sign") return "signed";
		if (type === "internal-to-approve") return "approved";
		return "";
	}, [type, searchParams.folder_id]);

	const currentTab =
		searchParams.type ||
		searchParams.status ||
		defaultStatus ||
		activeStatusKeys[0];

	const fieldConfig = useRegistryConfig(type, currentTab);

	const fetchUrl = useMemo(() => {
		const configUrl = STATUS_CONFIG[currentTab]?.apiUrl;
		return configUrl || url;
	}, [currentTab, url]);

	const { data: countersData } = useGetQuery({
		url: isInternal
			? ApiRoutes.GET_INTERNAL_COUNTERS
			: ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
		params: extraParams?.kind ? { kind: extraParams.kind } : {},
		options: {
			keepPreviousData: true,
			staleTime: 5000,
		},
	});

	const { data: foldersData } = useGetQuery({
		url: isInternal ? ApiRoutes.GET_INTERNAL_FOLDERS : ApiRoutes.GET_FOLDERS,
		params: {},
	});

	const folders = useMemo(() => {
		if (isInternal) {
			return foldersData?.data?.custom_flat || [];
		}
		return foldersData?.data || [];
	}, [foldersData, isInternal]);

	const currentConfig = STATUS_CONFIG[currentTab] || {};

	const tableQueryParams = buildRegistryQueryParams({
		currentTab,
		currentConfig,
		searchParams,
		extraParams,
	});

	const { data: responseData } = useGetQuery({
		url: fetchUrl,
		params: tableQueryParams,
	});

	const breadcrumbs = useRegistryBreadcrumbs({
		type,
		folderId: searchParams.folder_id,
		folders,
		setParams,
	});

	const rawDocuments =
		(responseData as any)?.data?.data || (responseData as any)?.data || [];
	const documents = useMemo(
		() => sortCorrespondenceById(rawDocuments),
		[rawDocuments],
	);
	// Laravel часто вкладывает мета-данные в объект meta
	const meta = useMemo(
		() => (responseData as any)?.data?.meta || (responseData as any)?.data || {},
		[responseData],
	);
	const counts = useMemo(
		() => (countersData as any)?.data || {},
		[countersData],
	);

	const statusTabs = useRegistryStatusTabs({
		activeStatusKeys,
		counts,
		currentTab,
		metaTotal: meta.total,
		fetchUrl,
		extraParams,
	});

	const handleTabChange = (statusId: string) => {
		const config = STATUS_CONFIG[statusId] || {};

		if (config.paramKey === "type") {
			setParams("type", statusId);
			setParams("status", undefined);
		} else {
			setParams("status", statusId);
			setParams("type", undefined);
		}

		// Фильтр по типу отклонения живёт только на вкладке «Отменено».
		if (statusId !== REJECTED_TAB_KEY) {
			setParams(REJECTION_TYPE_PARAM, undefined);
		}

		setParams("page", 1);
	};

	const handlePageChange = (page: number) => {
		setParams("page", page);
	};

	const handleFilterApply = (newFilters: any) => {
		Object.entries(newFilters).forEach(([key, val]) => {
			setParams(key, val);
		});
		setParams("page", 1);
	};

	const handleFilterReset = () => {
		setParams("incomingNumber", undefined);
		setParams("outgoingNumber", undefined);
		setParams("sender", undefined);
		setParams("sender_name", undefined);
		setParams("date", undefined);
		setParams("date_from", undefined);
		setParams("date_to", undefined);
		setParams(REJECTION_TYPE_PARAM, undefined);
		setParams("page", 1);
	};

	const showRoute = getRegistryShowRoute(type);

	const handleCardClick = (id: string | number) => {
		navigate(showRoute.replace(":id", String(id)), {
			state: {
				fromRegistry: `${location.pathname}${location.search}`,
				lastOpenedId: String(id),
			},
		});
	};

	const handleVersionClick = (id: number, versionId?: number, versionNum?: string) => {
		navigate(showRoute.replace(":id", String(id)), {
			state: {
				fromRegistry: `${location.pathname}${location.search}`,
				lastOpenedId: String(id),
				openVersions: true,
				targetVersionId: versionId,
				targetVersionNum: versionNum,
			},
		});
	};

	const handleCreate = () => {
		navigate(`${location.pathname}/create`);
	};

	return (
		<ConfigProvider
			theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
		>
			<div className="relative">
				<RegistryLayout
				documents={documents}
				meta={meta}
				tabs={statusTabs}
				activeTabId={currentTab}
				createButtonText={createButtonText}
				onTabChange={handleTabChange}
				onPageChange={handlePageChange}
				onFilterApply={handleFilterApply}
				onFilterReset={handleFilterReset}
				onCardClick={handleCardClick}
				onVersionClick={handleVersionClick}
				onCreate={handleCreate}
				currentFilters={{
					incomingNumber: searchParams.incomingNumber,
					outgoingNumber: searchParams.outgoingNumber,
					sender: searchParams.sender,
					[REJECTION_TYPE_PARAM]: searchParams[REJECTION_TYPE_PARAM],
					q: searchParams.q,
					outgoing_number: searchParams.outgoing_number,
					incoming_number: searchParams.incoming_number,
					created_date: searchParams.created_date,
				}}
				statusConfig={STATUS_CONFIG}
				fieldConfig={{
					...fieldConfig,
					getActions: (record: any) =>
						fieldConfig.getActions(record, handleOpenMoveModal),
				}}
				breadcrumbs={breadcrumbs}
			/>

			<MoveToFolderModal
				isOpen={isMoveModalOpen}
				onClose={() => setIsMoveModalOpen(false)}
				documentId={movingDocId}
				folders={folders}
				isInternal={isInternal}
			/>
			</div>
		</ConfigProvider>
	);
};
