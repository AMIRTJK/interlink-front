import { Download } from "lucide-react";
import { If } from "@shared/ui";
import { IApiFile, formatBytes, getFileType } from "../lib";
import { FormatIcon } from "./FormatIcon";

interface IProps {
	file: IApiFile;
	unavailableNotice?: string;
	showDownloadButton?: boolean;
	onDownload?: () => void;
}

export const UnavailablePreview = ({
	file,
	unavailableNotice,
	showDownloadButton = false,
	onDownload,
}: IProps) => {
	const fileType = getFileType(file.extension);

	return (
		<div className="flex flex-col items-center justify-center space-y-4 text-center">
			<div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
				<FormatIcon type={fileType} />
			</div>
			<div className="space-y-1">
				<h4 className="text-lg font-bold text-slate-800 dark:text-zinc-200">
					{file.original_name}
				</h4>
				<p className="text-xs text-slate-400 dark:text-zinc-500">
					Формат: {file.extension.toUpperCase()} • Размер:{" "}
					{formatBytes(file.size)}
				</p>
				<p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto pt-2">
					{unavailableNotice ||
						"Этот тип файла не поддерживает предпросмотр в браузере. Вы можете скачать его на свой компьютер для работы."}
				</p>
			</div>

			<If is={showDownloadButton && Boolean(onDownload)}>
				<button
					type="button"
					onClick={onDownload}
					className="px-6 py-2.5 rounded-full text-xs font-bold text-white! bg-indigo-600! hover:bg-indigo-700! transition-colors shadow-lg shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
				>
					<Download size={14} />
					<span>Скачать файл</span>
				</button>
			</If>
		</div>
	);
};
