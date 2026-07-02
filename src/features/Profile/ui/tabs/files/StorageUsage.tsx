import React from "react";
import { HardDrive } from "lucide-react";
import { If } from "@shared/ui";
import { IApiFile, IDiskMeta, formatBytes, getFileType } from "./lib";

interface IProps {
	meta: IDiskMeta | null;
	files: IApiFile[];
}

export const StorageUsage = ({ meta, files }: IProps) => {
	const totalCapacityBytes =
		meta?.storage_limit_bytes ?? meta?.limit ?? 1024 * 1024 * 1024;
	const totalUsedBytes = meta?.storage_used_bytes ?? meta?.total_size ?? 0;

	const percentage =
		meta?.usage_pct ??
		Math.min((totalUsedBytes / totalCapacityBytes) * 100, 100);

	const displayPercentage = totalUsedBytes > 0 ? Math.max(percentage, 1) : 0;

	const getInfoByType = (type: string) => {
		if (meta?.type_breakdown && Array.isArray(meta.type_breakdown)) {
			const matchingTypesMap: Record<string, string[]> = {
				pdf: ["pdf"],
				document: ["document", "doc", "docx", "txt", "rtf"],
				spreadsheet: ["spreadsheet", "sheet", "xls", "xlsx", "csv"],
				image: ["image", "img", "png", "jpg", "jpeg", "gif", "webp", "svg"],
				archive: ["archive", "zip", "rar", "tar", "gz", "7z"],
			};

			const aliases = matchingTypesMap[type] || [type];
			const items = meta.type_breakdown.filter((item) =>
				aliases.includes(item.type.toLowerCase()),
			);
			if (items.length > 0) {
				const count = items.reduce((sum, item) => sum + (item.count || 0), 0);
				const size = items.reduce(
					(sum, item) => sum + (item.total_size || 0),
					0,
				);
				return { count, size };
			}
		}

		const filtered = files.filter((f) => getFileType(f.extension) === type);
		const count = filtered.length;
		const size = filtered.reduce((sum, f) => sum + (f.size || 0), 0);
		return { count, size };
	};

	const pdfInfo = getInfoByType("pdf");
	const docInfo = getInfoByType("document");
	const sheetInfo = getInfoByType("spreadsheet");
	const imageInfo = getInfoByType("image");
	const archiveInfo = getInfoByType("archive");

	const legendItems = [
		{
			label: "PDF",
			count: pdfInfo.count,
			size: pdfInfo.size,
			color: "bg-blue-500!",
		},
		{
			label: "Документы",
			count: docInfo.count,
			size: docInfo.size,
			color: "bg-cyan-400!",
		},
		{
			label: "Таблицы",
			count: sheetInfo.count,
			size: sheetInfo.size,
			color: "bg-fuchsia-500!",
		},
		{
			label: "Изображения",
			count: imageInfo.count,
			size: imageInfo.size,
			color: "bg-yellow-400!",
		},
		{
			label: "Архивы",
			count: archiveInfo.count,
			size: archiveInfo.size,
			color: "bg-zinc-400!",
		},
	];

	return (
		<div className="bg-slate-50/50 dark:bg-slate-900/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 font-semibold text-sm">
					<HardDrive size={16} className="text-slate-400" />
					<span>Хранилище</span>
				</div>
				<span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
					{formatBytes(totalUsedBytes)} / {formatBytes(totalCapacityBytes)}
				</span>
			</div>

			<div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
				<div
					className="storage-progress-bar h-full rounded-full transition-all duration-500"
					style={{ width: `${displayPercentage}%` }}
				/>
			</div>

			<div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
				{legendItems.map((item) => (
					<div
						key={item.label}
						className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400"
					>
						<span className={`w-2 h-2 rounded-full ${item.color}`} />
						<span>{item.label}</span>
						<span className="text-slate-800 dark:text-zinc-200 font-bold">
							{item.count}
						</span>
						<If is={item.size > 0}>
							<span className="text-slate-400 dark:text-zinc-500 font-normal">
								({formatBytes(item.size)})
							</span>
						</If>
					</div>
				))}
			</div>
		</div>
	);
};
