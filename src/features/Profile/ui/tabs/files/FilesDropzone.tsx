import { useRef, useState } from "react";

interface IProps {
	onUpload: (file: File) => void;
}

export const FilesDropzone = ({ onUpload }: IProps) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragOver(true);
			}}
			onDragLeave={() => setIsDragOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setIsDragOver(false);
				const file = e.dataTransfer.files?.[0];
				if (file) onUpload(file);
			}}
			onClick={() => fileInputRef.current?.click()}
			className={`w-full py-6 border-2 border-dashed rounded-3xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
				isDragOver
					? "border-indigo-600 bg-indigo-50/30 text-indigo-600"
					: "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
			}`}
		>
			<input
				type="file"
				ref={fileInputRef}
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) onUpload(file);
				}}
				className="hidden!"
			/>
			<span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
				↑ Перетащите файлы или нажмите, чтобы загрузить
			</span>
		</div>
	);
};
