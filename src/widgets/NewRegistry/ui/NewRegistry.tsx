import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetQuery, useDynamicSearchParams } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import { useQueries } from "@tanstack/react-query";
import {
	Handshake,
	CheckCheck,
	XCircle,
	Signature,
	Send,
	Clock,
	FileEdit,
	LoaderCircle,
} from "lucide-react";
import { RegistryLayout } from "./RegistryLayout";
import { AppRoutes } from "@shared/config";
import { useRegistryConfig } from "../lib";
import { IBreadcrumbItem } from "@shared/ui";
import { MoveToFolderModal } from "./MoveToFolderModal";

// Иконка вкладки «Подписан»: документ с текстом и ручка, ставящая подпись.
// Собрана в стиле lucide (24×24, stroke=currentColor), поэтому наследует
// цвет и размер так же, как остальные иконки статусов.
const FileSignatureIcon = ({
	size = 24,
	...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		{/* Лист документа со скруглённым отогнутым уголком */}
		<path d="m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351" />
		{/* Строки текста */}
		<path d="M8 8h4" />
		<path d="M8 12h3" />
		{/* Росчерк подписи */}
		<path d="M7 17.5c1-1.3 2-1.3 3 0s2 1.3 3 0" />
		{/* Ручка, ставящая подпись */}
		<path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
	</svg>
);

const STATUS_CONFIG: Record<string, any> = {
	draft: {
		label: "Черновик",
		icon: <Clock size={14} />,
		gradient: "from-blue-500 to-blue-600",
	},
	analysis: {
		label: "Анализ",
		icon: <FileEdit size={14} />,
		gradient: "from-blue-500 to-blue-600",
	},
	["in-progress"]: {
		label: "В процессе исполнения",
		icon: <Clock size={14} />,
		gradient: "from-amber-500 to-amber-600",
	},
	to_approve: {
		label: "На согласование",
		icon: <LoaderCircle size={14} />,
		gradient: "from-orange-500 to-orange-600",
		apiUrl: ApiRoutes.GET_INTERNAL_TO_APPROVE,
		paramKey: "type",
		omitStatus: true,
	},
	approved: {
		label: "Согласован",
		icon: <Handshake size={14} />,
		gradient: "from-blue-500 to-blue-600",
		apiUrl: ApiRoutes.GET_INTERNAL_PROCESSED,
		paramKey: "type",
		omitStatus: true,
	},
	to_sign: {
		label: "На подпись",
		icon: <FileSignatureIcon size={14} />,
		gradient: "from-yellow-400 to-yellow-500",
		apiUrl: ApiRoutes.GET_INTERNAL_TO_SIGN,
		paramKey: "type",
		omitStatus: true,
	},
	signed: {
		label: "Подписан",
		icon: <Signature size={14} />,
		gradient: "from-purple-500 to-purple-600",
		apiUrl: ApiRoutes.GET_INTERNAL_PROCESSED,
		paramKey: "type",
		omitStatus: true,
	},
	sent: {
		label: "Отправлено",
		icon: <Send size={14} />,
		gradient: "from-green-500 to-green-600",
		apiUrl: ApiRoutes.GET_INTERNAL_OUTGOING,
	},
	completed: {
		label: "Завершено",
		icon: <CheckCheck size={14} />,
		gradient: "from-green-500 to-green-600",
	},
	canceled: {
		label: "Отменено",
		icon: <XCircle size={14} />,
		gradient: "from-red-500 to-red-600",
	},
	default: {
		label: "Документ",
		icon: <FileEdit size={14} />,
		gradient: "from-gray-500 to-gray-600",
	},
};

const REGISTRY_STATUS_MAP: Record<string, string[]> = {
	incoming: [],
	outgoing: ["to_approve", "approved", "to_sign", "signed", "sent"],
	default: ["draft", "in-progress", "completed"],
};

interface NewRegistryProps {
	type: string;
	createButtonText?: string;
	url?: string;
	extraParams?: Record<string, unknown>;
}

export const NewRegistry = ({
	type,
	createButtonText,
	url = ApiRoutes.GET_CORRESPONDENCES,
	extraParams,
}: NewRegistryProps) => {
	const navigate = useNavigate();
	const location = useLocation();

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

	const breadcrumbs = useMemo(() => {
		const items: IBreadcrumbItem[] = [];

		const rootLabel =
			type === "internal-incoming"
				? "Входящие"
				: type === "internal-outgoing"
					? "Исходящие"
					: type === "internal-drafts"
						? "Черновики"
						: type === "internal-to-sign"
							? "На подпись"
							: type === "internal-to-approve"
								? "На согласование"
								: "Реестр";

		items.push({
			label: rootLabel,
			onClick: () => {
				setParams("folder_id", undefined);
				setParams("status", undefined);
			},
		});

		if (searchParams.folder_id && folders.length > 0) {
			const path: IBreadcrumbItem[] = [];
			let currentId: number | null = parseInt(searchParams.folder_id, 10);

			while (currentId) {
				const folder = folders.find((f: any) => f.id === currentId);
				if (folder) {
					if (folder.name !== rootLabel) {
						const siblings = folders
							.filter(
								(f: any) =>
									f.parent_id === folder.parent_id && f.id !== folder.id,
							)
							.map((s: any) => ({
								label: s.name,
								onClick: () => setParams("folder_id", String(s.id)),
							}));

						const subfolders = folders
							.filter((f: any) => f.parent_id === folder.id)
							.map((s: any) => ({
								label: s.name,
								onClick: () => setParams("folder_id", String(s.id)),
							}));

						const allOptions: any[] = [];

						if (subfolders.length > 0) {
							allOptions.push({ label: "Вложенные папки", isHeader: true });
							allOptions.push(...subfolders);
						}

						if (siblings.length > 0) {
							if (allOptions.length > 0) allOptions.push({ isDivider: true });
							allOptions.push({ label: "Другие папки", isHeader: true });
							allOptions.push(...siblings);
						}

						path.unshift({
							label: folder.name,
							onClick: () => setParams("folder_id", String(folder.id)),
							options: allOptions.length > 0 ? allOptions : undefined,
						});
					}
					currentId = folder.parent_id;
				} else {
					currentId = null;
				}
			}
			items.push(...path);
		}

		if (items.length > 0) {
			items[items.length - 1].isActive = true;
		}

		return items;
	}, [type, searchParams.folder_id, folders, setParams]);

	const documents =
		(responseData as any)?.data?.data || (responseData as any)?.data || [];
	// Laravel часто вкладывает мета-данные в объект meta
	const meta =
		(responseData as any)?.data?.meta || (responseData as any)?.data || {};
	const counts = useMemo(
		() => (countersData as any)?.data || {},
		[countersData],
	);

	// Запрашиваем мета-данные для счетчиков проблемных вкладок (бэкенд может отдавать 0)
	const tabsToFetch = useMemo(() => {
		return activeStatusKeys.filter((key) => {
			// Принудительно запрашиваем мета-данные для счетчиков проблемных вкладок
			if (["approved", "signed", "sent", "analysis"].includes(key)) {
				return true;
			}
			const existingCount =
				counts[key] ??
				counts[key.replace("-", "_")] ??
				counts[`${key}_total`] ??
				counts[`${key.replace("-", "_")}_total`] ??
				counts[`${key}_count`];
			return existingCount === undefined || existingCount === null;
		});
	}, [activeStatusKeys, counts]);

	const fallbackQueries = useQueries({
		queries: tabsToFetch.map((key) => {
			const config = STATUS_CONFIG[key] || {};
			const configUrl = config.apiUrl || fetchUrl;
			const configParams = config.apiParams || {};

			const queryParams: Record<string, any> = {
				...extraParams,
				...configParams,
				per_page: 1,
			};

			if (config.paramKey === "type") {
				queryParams.type = key;
			} else if (!config.omitStatus) {
				queryParams.status = key;
			}

			return {
				queryKey: [configUrl, queryParams],
				queryFn: async () => {
					const res = await _axios.get(configUrl, {
						params: queryParams,
					});
					const serverData = res.data;
					const fetchedMeta =
						serverData?.data?.meta ||
						serverData?.meta ||
						serverData?.data ||
						serverData;

					return { key, total: fetchedMeta?.total ?? 0 };
				},
				staleTime: 5000,
				keepPreviousData: true,
			};
		}),
	});

	const fallbackCounts = useMemo(() => {
		const obj: Record<string, number> = {};
		fallbackQueries.forEach((q) => {
			if (q.data) {
				obj[q.data.key] = q.data.total;
			}
		});
		return obj;
	}, [fallbackQueries]);

	const statusTabs = useMemo(() => {
		return activeStatusKeys
			.map((key) => {
				const config = STATUS_CONFIG[key];
				if (!config) return null;
				let count =
					fallbackCounts[key] ??
					counts[key] ??
					counts[key.replace("-", "_")] ??
					counts[`${key}_total`] ??
					counts[`${key.replace("-", "_")}_total`] ??
					counts[`${key}_count`] ??
					0;

				if (key === currentTab && meta.total !== undefined) {
					count = meta.total;
				}

				return {
					id: key,
					label: config.label,
					icon: config.icon,
					gradient: config.gradient,
					count,
				};
			})
			.filter(Boolean);
	}, [counts, activeStatusKeys, currentTab, meta.total, fallbackCounts]);

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
	);
};
