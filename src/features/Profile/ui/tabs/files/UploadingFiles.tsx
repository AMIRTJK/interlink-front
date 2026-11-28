import { Progress, Spin } from "antd";
import { Tooltip } from "@shared/ui";
import { formatBytes } from "./lib";
import type { TFilesViewMode } from "./filesTabModel";
import {
	UPLOAD_COMPLETE_PERCENT,
	UPLOAD_TEXTS,
	type IUploadingFile,
} from "./fileUploadModel";

interface IItemProps {
	item: IUploadingFile;
}

const UploadStatus = ({ item }: IItemProps) => {
	if (item.progress === null) {
		return (
			<p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
				{UPLOAD_TEXTS.uploading}
			</p>
		);
	}
	if (item.progress >= UPLOAD_COMPLETE_PERCENT) {
		return (
			<p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
				{UPLOAD_TEXTS.processing}
			</p>
		);
	}
	return <Progress percent={item.progress} size="small" />;
};

const UploadingFileCard = ({ item }: IItemProps) => (
	<div className="bg-white dark:bg-th-raised rounded-[2rem] ui-glass border border-zinc-200 dark:border-th-high overflow-hidden">
		<div className="h-32 flex items-center justify-center bg-slate-50 dark:bg-th-base/40">
			<Spin size="large" />
		</div>
		<div className="p-5 space-y-1">
			<Tooltip title={item.name}>
				<h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
					{item.name}
				</h4>
			</Tooltip>
			<p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
				{formatBytes(item.size)}
			</p>
			<UploadStatus item={item} />
		</div>
	</div>
);

const UploadingFileRow = ({ item }: IItemProps) => (
	<div className="flex items-center gap-3 py-3 px-4">
		<Spin size="small" />
		<Tooltip title={item.name}>
			<span className="flex-1 min-w-0 text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
				{item.name}
			</span>
		</Tooltip>
		<span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 shrink-0">
			{formatBytes(item.size)}
		</span>
		<div className="w-40 shrink-0">
			<UploadStatus item={item} />
		</div>
	</div>
);

interface IProps {
	uploads: IUploadingFile[];
	viewMode: TFilesViewMode;
}

export const UploadingFiles = ({ uploads, viewMode }: IProps) => {
	if (uploads.length === 0) return null;

	if (viewMode === "list") {
		return (
			<div
				role="status"
				aria-live="polite"
				className="ui-glass-soft bg-white dark:bg-th-raised rounded-3xl border border-slate-100 dark:border-th-high divide-y divide-slate-100 dark:divide-th-high"
			>
				{uploads.map((item) => (
					<UploadingFileRow key={item.id} item={item} />
				))}
			</div>
		);
	}

	return (
		<div
			role="status"
			aria-live="polite"
			className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
		>
			{uploads.map((item) => (
				<UploadingFileCard key={item.id} item={item} />
			))}
		</div>
	);
};
