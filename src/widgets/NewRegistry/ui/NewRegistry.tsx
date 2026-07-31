import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetQuery, useDynamicSearchParams } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { ConfigProvider, theme } from "antd";
import { RegistryLayout } from "./RegistryLayout";
import { AppRoutes } from "@shared/config";
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

export const NewRegistry = ({
	type,
	createButtonText,
	url = ApiRoutes.GET_CORRESPONDENCES,
	extraParams,
}: NewRegistryProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const isDark = useIsDarkMode();

	const fieldConfig = useRegistryConfig(type);
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

	const tableQueryParams: Record<string, any> = {
		...extraParams,
		...searchParams,
		...(currentConfig.apiParams || {}),
		page: searchParams.page || 1,
		per_page: searchParams.per_page || 9,
	};

	if (currentConfig.paramKey === "type") {
		tableQueryParams.type = currentTab;
		delete tableQueryParams.status;
	} else if (!currentConfig.omitStatus) {
		tableQueryParams.status = currentTab;
		delete tableQueryParams.type;
	}

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

	const documents =
		(responseData as any)?.data?.data || (responseData as any)?.data || [];
	// Laravel часто вкладывает мета-данные в объект meta
	const meta =
		(responseData as any)?.data?.meta || (responseData as any)?.data || {};
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
		setParams("page", 1);
	};

	const handleCardClick = (id: string | number) => {
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

		navigate(route.replace(":id", String(id)));
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
				onCreate={handleCreate}
				currentFilters={{
					incomingNumber: searchParams.incomingNumber,
					outgoingNumber: searchParams.outgoingNumber,
					sender: searchParams.sender,
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
