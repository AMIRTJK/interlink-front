import { If } from "@shared/ui";
import { TPreviewType } from "./types";

interface IProps {
	previewType: TPreviewType;
	blobUrl: string | null;
	fileName: string;
}

export const MediaPreview = ({ previewType, blobUrl, fileName }: IProps) => {
	const isImage = previewType === "image" && !!blobUrl;
	const isPdf = previewType === "pdf" && !!blobUrl;
	const isVideo = previewType === "video" && !!blobUrl;

	return (
		<>
			<If is={isImage}>
				<div className="w-full max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-black/5 dark:bg-black/20">
					<img
						src={blobUrl || ""}
						alt={fileName}
						className="max-w-full max-h-[70vh] object-contain rounded-2xl"
					/>
				</div>
			</If>

			<If is={isPdf}>
				<div className="w-full h-[70vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white">
					<iframe
						src={blobUrl || ""}
						title={fileName}
						className="w-full h-full border-0 rounded-2xl"
					/>
				</div>
			</If>

			<If is={isVideo}>
				<div className="w-full max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-black">
					<video
						src={blobUrl || ""}
						controls
						controlsList="nodownload"
						preload="metadata"
						className="max-w-full max-h-[70vh] rounded-2xl"
					>
						Ваш браузер не поддерживает воспроизведение видео.
					</video>
				</div>
			</If>
		</>
	);
};
