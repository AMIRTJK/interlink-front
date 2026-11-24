import { useRef, useState } from "react";
import { UPLOAD_TEXTS } from "./fileUploadModel";

interface IProps {
	onUpload: (files: File[]) => void;
	isUploading: boolean;
}

const getDropzoneStateClass = (isUploading: boolean, isDragOver: boolean) => {
	if (isUploading) {
		return "cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400 opacity-70";
	}
	if (isDragOver) {
		return "cursor-pointer border-indigo-600 bg-indigo-50/30 text-indigo-600";
	}
	return "cursor-pointer border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700";
};

export const FilesDropzone =({ onUpload, isUploading }: IProps) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				if (!isUploading) setIsDragOver(true);
			}}
			onDragLeave={() => setIsDragOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setIsDragOver(false);
				if (isUploading) return;
				const files = Array.from(e.dataTransfer.files ?? []);
				if (files.length > 0) onUpload(files);
			}}
			onClick={() => {
				if (!isUploading) fileInputRef.current?.click();
			}}
			aria-disabled={isUploading}
			className={`w-full py-6 border-2 border-dashed rounded-3xl flex items-center justify-center gap-2 transition-all ${getDropzoneStateClass(
				isUploading,
				isDragOver,
			)}`}
		>
			<input
				type="file"
				multiple
				ref={fileInputRef}
				onChange={(e) => {
					const files = Array.from(e.target.files ?? []);
					e.target.value = "";
					if (files.length > 0) onUpload(files);
				}}
				className="hidden!"
			/>
			<span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
				{isUploading
					? UPLOAD_TEXTS.dropzoneBusy
					: "↑ Перетащите файлы или нажмите, чтобы загрузить"}
			</span>
		</div>
	);
};
