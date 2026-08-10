import React from "react";
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
import { ApiRoutes } from "@shared/api";

export interface NewRegistryProps {
	type: string;
	createButtonText?: string;
	url?: string;
	extraParams?: Record<string, unknown>;
}

// Иконка вкладки «Подписан»: документ с текстом и ручка, ставящая подпись.
// Собрана в стиле lucide (24×24, stroke=currentColor), поэтому наследует
// цвет и размер так же, как остальные иконки статусов.
export const FileSignatureIcon = ({
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

export const STATUS_CONFIG: Record<string, any> = {
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
	no_assignment: {
		label: "Без поручения",
		icon: <Clock size={14} />,
		gradient: "from-blue-500 to-blue-600",
	},
	submitted: {
		label: "На проверке",
		icon: <FileEdit size={14} />,
		gradient: "from-purple-500 to-purple-600",
	},
	returned: {
		label: "На доработке",
		icon: <XCircle size={14} />,
		gradient: "from-rose-500 to-rose-600",
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
		gradient: "from-rose-500 to-rose-600",
		omitStatus: true,
	},
	default: {
		label: "Документ",
		icon: <FileEdit size={14} />,
		gradient: "from-gray-500 to-gray-600",
	},
};

export const REGISTRY_STATUS_MAP: Record<string, string[]> = {
	incoming: [],
	outgoing: ["to_approve", "approved", "to_sign", "signed", "sent", "canceled"],
	default: ["draft", "in-progress", "completed"],
};
