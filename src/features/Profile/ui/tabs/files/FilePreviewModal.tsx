import { If } from "@shared/ui";
import { IApiFile } from "./lib";
import { PreviewStyles } from "./preview/PreviewStyles";
import { PreviewHeader } from "./preview/PreviewHeader";
import { PreviewFooter } from "./preview/PreviewFooter";
import { MediaPreview } from "./preview/MediaPreview";
import { PptxPreview } from "./preview/PptxPreview";
import { DocPreview } from "./preview/DocPreview";
import { ExcelPreview } from "./preview/ExcelPreview";
import { TextPreview } from "./preview/TextPreview";
import { UnavailablePreview } from "./preview/UnavailablePreview";
import { useFilePreview } from "./preview/useFilePreview";

interface IProps {
	file: IApiFile | null;
	onClose: () => void;
	unavailableNotice?: string;
}

export const FilePreviewModal = ({
	file,
	onClose,
	unavailableNotice,
}: IProps) => {
	const {
		blobUrl,
		htmlContent,
		setHtmlContent,
		textContent,
		pptxSlides,
		currentSlideIndex,
		setCurrentSlideIndex,
		excelSheets,
		activeSheetIndex,
		setActiveSheetIndex,
		previewType,
		isLoading,
		showUnavailable,
		handleDownload,
	} = useFilePreview(file);

	return (
		<If is={Boolean(file)}>
			<div
				className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
				onClick={onClose}
			>
				<div
					className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-[92vw]! xl:max-w-[1600px]! overflow-hidden animate-in fade-in zoom-in duration-200"
					onClick={(e) => e.stopPropagation()}
				>
					<PreviewHeader
						fileName={file?.original_name || ""}
						onClose={onClose}
					/>

					<div className="p-8 flex flex-col items-center justify-center min-h-[420px] bg-slate-50/30 dark:bg-slate-900/30">
						<PreviewStyles />

						<If is={isLoading}>
							<div className="flex flex-col items-center justify-center space-y-2">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
								<span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
									Загрузка предпросмотра...
								</span>
							</div>
						</If>

						<If is={!isLoading}>
							<MediaPreview
								previewType={previewType}
								blobUrl={blobUrl}
								fileName={file?.original_name || ""}
							/>

							<If is={previewType === "pptx" && pptxSlides.length > 0}>
								<PptxPreview
									pptxSlides={pptxSlides}
									currentSlideIndex={currentSlideIndex}
									setCurrentSlideIndex={setCurrentSlideIndex}
									fileName={file?.original_name || ""}
								/>
							</If>

							<If is={previewType === "html-doc" && !!htmlContent}>
								<DocPreview htmlContent={htmlContent || ""} />
							</If>

							<If is={previewType === "html-xls" && !!htmlContent}>
								<ExcelPreview
									excelSheets={excelSheets}
									activeSheetIndex={activeSheetIndex}
									setActiveSheetIndex={setActiveSheetIndex}
									htmlContent={htmlContent || ""}
									setHtmlContent={setHtmlContent}
								/>
							</If>

							<If is={previewType === "text" && textContent !== null}>
								<TextPreview textContent={textContent || ""} />
							</If>

							<If is={previewType === "none"}>
								<UnavailablePreview file={file!} />
							</If>

							<If is={showUnavailable}>
								<UnavailablePreview
									file={file!}
									unavailableNotice={unavailableNotice}
									showDownloadButton={true}
									onDownload={handleDownload}
								/>
							</If>
						</If>
					</div>

					<PreviewFooter onClose={onClose} onDownload={handleDownload} />
				</div>
			</div>
		</If>
	);
};
