import React from "react";
import {
	Pin,
	Archive,
	FileText,
	FileSpreadsheet,
	Eye,
	Check,
	Image as ImageIcon,
	Video,
	Presentation,
	GripVertical,
} from "lucide-react";
import { If } from "@shared/ui";
import { IApiFile, getFileType } from "./lib";

interface IProps {
	file: IApiFile;
	isSelected: boolean;
	isReorderEnabled: boolean;
	showSelection?: boolean;
	onView: (file: IApiFile) => void;
	onTogglePin?: (file: IApiFile) => void;
	onToggleSelectFile?: (id: number) => void;
}

const COVER_STYLES: Record<
	string,
	{ bg: string; icon: React.ComponentType<any> }
> = {
	image: { bg: "from-pink-500 to-rose-400", icon: ImageIcon },
	archive: { bg: "from-amber-500 to-orange-400!", icon: Archive },
	spreadsheet: { bg: "excel-grid-bg", icon: FileSpreadsheet },
	pdf: { bg: "from-red-500 to-rose-500!", icon: FileText },
	video: { bg: "from-purple-600 to-indigo-600!", icon: Video },
	presentation: { bg: "from-orange-500 to-amber-600!", icon: Presentation },
};

const getCoverContent = (file: IApiFile) => {
	const fileType = getFileType(file.extension);
	const isMarkdown = file.original_name.endsWith(".md");
	const docBg = isMarkdown
		? "from-slate-600 to-slate-500!"
		: "from-blue-600 to-indigo-500!";
	const config = COVER_STYLES[fileType] || { bg: docBg, icon: FileText };
	const Icon = config.icon;
	const bgClass = config.bg.includes(" ")
		? `bg-gradient-to-tr ${config.bg}`
		: config.bg;

	return (
		<div className={`w-full h-full ${bgClass} flex items-center justify-center`}>
			<Icon
				size={42}
				className="text-white! transition-all duration-200 group-hover/cover:opacity-0 group-hover/cover:scale-75"
			/>
		</div>
	);
};

export const FileCardCover = ({
	file,
	isSelected,
	isReorderEnabled,
	showSelection = false,
	onView,
	onTogglePin,
	onToggleSelectFile,
}: IProps) => (
	<div
		onClick={() => onView(file)}
		className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer group/cover"
	>
		{getCoverContent(file)}

		<div className="absolute inset-0 bg-black/30 dark:bg-black/55 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
			<Eye size={42} className="text-white!" />
		</div>

		<If is={showSelection}>
			<div
				onClick={(e) => {
					e.stopPropagation();
					onToggleSelectFile?.(file.id);
				}}
				className={`absolute top-4 left-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all z-10 cursor-pointer ${
					isSelected
						? "bg-indigo-600! border-indigo-600! text-white! scale-100 opacity-100 shadow-md"
						: "bg-black/20 border-white/60 text-transparent scale-0 group-hover:scale-100 group-hover:opacity-100 hover:border-white hover:bg-black/35 focus:scale-100 focus:opacity-100"
				}`}
			>
				<If is={isSelected}>
					<Check size={12} className="stroke-[3]" />
				</If>
			</div>
		</If>

		<If is={Boolean(onTogglePin)}>
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onTogglePin?.(file);
				}}
				className={`absolute top-3 right-3 p-1.5 rounded-full transition-all cursor-pointer ${
					file.is_starred
						? "bg-amber-500! text-white! scale-100"
						: "bg-black/40 text-white/80 hover:bg-black/60 scale-0 group-hover:scale-100 focus:scale-100"
				}`}
			>
				<Pin size={14} className={file.is_starred ? "fill-white!" : ""} />
			</button>
		</If>

		<If is={isReorderEnabled}>
			<div
				onClick={(e) => e.stopPropagation()}
				onMouseDown={(e) => e.stopPropagation()}
				className="absolute bottom-3 right-3 p-1.5 bg-black/40 rounded-full text-white/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
			>
				<GripVertical size={14} />
			</div>
		</If>
	</div>
);
