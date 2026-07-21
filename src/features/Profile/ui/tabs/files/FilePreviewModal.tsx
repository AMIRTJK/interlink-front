import React, { useState, useEffect } from "react";
import {
	X,
	Download,
	FileText,
	FileSpreadsheet,
	Archive,
	Image as ImageIcon,
	Eye,
	Presentation,
	Video,
} from "lucide-react";
import { IApiFile, formatBytes, getFileType } from "./lib";
import { If } from "@shared/ui";
import { _axios } from "@shared/api";
import { toast } from "@shared/lib/toast";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

interface IProps {
	file: IApiFile | null;
	onClose: () => void;
	/**
	 * Текст заглушки, когда предпросмотр не удалось загрузить (пустой ответ/ошибка
	 * запроса файла). Например, для вложений корреспонденции — пока бэкенд не
	 * поднял API отдачи файла. Если не передан, показывается общий текст.
	 */
	unavailableNotice?: string;
}

interface IPptxSlide {
	slideNumber: number;
	title: string;
	texts: string[];
}

interface IExcelSheet {
	name: string;
	html: string;
}

const fetchFileBuffer = async (
	url?: string,
	responseType: "blob" | "text" = "blob",
) => {
	if (!url) {
		throw new Error("URL is required to fetch file buffer");
	}
	if (url.startsWith("blob:") || url.startsWith("data:")) {
		const res = await fetch(url);
		if (responseType === "text") {
			return { data: await res.text() };
		}
		return { data: await res.blob() };
	}
	return _axios.get(url, { responseType });
};

// Можно ли отдать ссылку напрямую в src <img>/<iframe>/<video> вместо загрузки
// байтов через XHR. Верно для blob:/data: и для публичной статики бэкенда
// (/storage/…): такие файлы не требуют токена, а браузеру для ПОКАЗА ресурса
// CORS-заголовки не нужны. Тянуть их через _axios нельзя — статика отдаётся без
// CORS (в config/cors.php только api/*), и браузер режет ответ CORS-ошибкой.
// Маршруты /api/… наоборот требуют Bearer-токен, поэтому их грузим blob-ом (ниже),
// чтобы приложить заголовок авторизации; CORS для них на бэкенде настроен.
const canRenderDirectly = (url?: string): boolean => {
	if (!url) {
		return false;
	}

	return /^(blob:|data:)/i.test(url) || !url.includes("/api/");
};

export const FilePreviewModal = ({
	file,
	onClose,
	unavailableNotice,
}: IProps) => {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [htmlContent, setHtmlContent] = useState<string | null>(null);
	const [textContent, setTextContent] = useState<string | null>(null);
	const [pptxSlides, setPptxSlides] = useState<IPptxSlide[]>([]);
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
	const [excelSheets, setExcelSheets] = useState<IExcelSheet[]>([]);
	const [activeSheetIndex, setActiveSheetIndex] = useState(0);
	const [previewType, setPreviewType] = useState<
		| "image"
		| "pdf"
		| "html-doc"
		| "html-xls"
		| "pptx"
		| "video"
		| "text"
		| "none"
	>("none");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!file) {
			setBlobUrl(null);
			setHtmlContent(null);
			setTextContent(null);
			setPptxSlides([]);
			setCurrentSlideIndex(0);
			setExcelSheets([]);
			setActiveSheetIndex(0);
			setPreviewType("none");
			return;
		}

		const ext = file.extension.toLowerCase();
		const isImage = [
			"png",
			"jpg",
			"jpeg",
			"gif",
			"webp",
			"svg",
			"bmp",
			"ico",
		].includes(ext);
		const isPdf = ext === "pdf";
		const isDocx = ["docx", "doc", "rtf", "odt", "dotx"].includes(ext);
		const isXlsx = ["xlsx", "xls", "csv", "ods", "xlsb", "xlsm"].includes(ext);
		const isPptx = ["pptx", "ppt", "potx", "ppsx", "odp"].includes(ext);
		const isVideo = ["mp4", "webm", "ogg", "mov", "mkv", "avi", "m4v"].includes(
			ext,
		);
		const isText = [
			"txt",
			"json",
			"log",
			"md",
			"ts",
			"tsx",
			"js",
			"jsx",
			"html",
			"css",
			"xml",
			"yaml",
			"yml",
			"ini",
			"conf",
			"sh",
			"bat",
		].includes(ext);

		const previewUrl = file.preview_url || "";
		const downloadUrl = file.download_url || "";
		let activeUrl: string | null = null;

		// Тихо логируем ошибку загрузки файла: пустой предпросмотр перехватит заглушка
		// ниже (showUnavailable) — с текстом unavailableNotice и кнопкой скачивания.
		const onFetchError = (err: unknown) => {
			console.error("Не удалось загрузить предпросмотр вложения", err);
		};

		if (isImage) {
			setPreviewType("image");
			if (canRenderDirectly(file.preview_url)) {
				setBlobUrl(file.preview_url);
			} else {
				setIsLoading(true);
				fetchFileBuffer(file.preview_url, "blob")
					.then((response) => {
						const url = URL.createObjectURL(response.data);
						activeUrl = url;
						setBlobUrl(url);
					})
					.catch(onFetchError)
					.finally(() => {
						setIsLoading(false);
					});
			}
		} else if (isPdf) {
			setPreviewType("pdf");
			if (canRenderDirectly(file.preview_url)) {
				setBlobUrl(file.preview_url);
			} else {
				setIsLoading(true);
				fetchFileBuffer(file.preview_url, "blob")
					.then((response) => {
						const url = URL.createObjectURL(response.data);
						activeUrl = url;
						setBlobUrl(url);
					})
					.catch(onFetchError)
					.finally(() => {
						setIsLoading(false);
					});
			}
		} else if (isVideo) {
			setPreviewType("video");
			if (canRenderDirectly(file.preview_url)) {
				setBlobUrl(file.preview_url);
			} else {
				setIsLoading(true);
				fetchFileBuffer(file.preview_url, "blob")
					.then((response) => {
						const url = URL.createObjectURL(response.data);
						activeUrl = url;
						setBlobUrl(url);
					})
					.catch(onFetchError)
					.finally(() => {
						setIsLoading(false);
					});
			}
		} else if (isPptx) {
			setPreviewType("pptx");
			setIsLoading(true);
			fetchFileBuffer(file.preview_url, "blob")
				.then(async (response) => {
					const arrayBuffer = await response.data.arrayBuffer();
					try {
						const JSZip = (await import("jszip")).default;
						const zip = await JSZip.loadAsync(arrayBuffer);
						const slideFiles = Object.keys(zip.files).filter((fileName) =>
							/^ppt\/slides\/slide\d+\.xml$/i.test(fileName),
						);

						slideFiles.sort((a, b) => {
							const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
							const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
							return numA - numB;
						});

						const slides: IPptxSlide[] = [];
						const parser = new DOMParser();

						for (let i = 0; i < slideFiles.length; i++) {
							const xmlStr = await zip.file(slideFiles[i])?.async("string");
							if (xmlStr) {
								const xmlDoc = parser.parseFromString(
									xmlStr,
									"application/xml",
								);
								const textNodes = Array.from(
									xmlDoc.getElementsByTagName("a:t"),
								);
								const slideTexts = textNodes
									.map((node) => node.textContent?.trim() || "")
									.filter(Boolean);
								const title = slideTexts[0] || `Слайд ${i + 1}`;
								const bodyTexts = slideTexts.slice(1);
								slides.push({
									slideNumber: i + 1,
									title,
									texts: bodyTexts,
								});
							}
						}

						if (slides.length > 0) {
							setPptxSlides(slides);
							setCurrentSlideIndex(0);
						} else {
							setPptxSlides([
								{
									slideNumber: 1,
									title: file.original_name,
									texts: ["Презентация PowerPoint"],
								},
							]);
						}
					} catch (e) {
						console.error("PPTX parse failed", e);
						setPptxSlides([
							{
								slideNumber: 1,
								title: file.original_name,
								texts: ["Не удалось извлечь содержимое слайдов"],
							},
						]);
					}
				})
				.catch(onFetchError)
				.finally(() => {
					setIsLoading(false);
				});
		} else if (isDocx) {
			setPreviewType("html-doc");
			setIsLoading(true);
			fetchFileBuffer(file.preview_url, "blob")
				.then(async (response) => {
					const arrayBuffer = await response.data.arrayBuffer();
					const result = await mammoth.convertToHtml({ arrayBuffer });
					setHtmlContent(result.value || "<p>Пустой документ</p>");
				})
				.catch(onFetchError)
				.finally(() => {
					setIsLoading(false);
				});
		} else if (isXlsx) {
			setPreviewType("html-xls");
			setIsLoading(true);
			fetchFileBuffer(file.preview_url, "blob")
				.then(async (response) => {
					const arrayBuffer = await response.data.arrayBuffer();
					const workbook = XLSX.read(arrayBuffer, { type: "array" });
					if (workbook.SheetNames.length > 0) {
						const sheets = workbook.SheetNames.map((sheetName) => ({
							name: sheetName,
							html: XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]),
						}));
						setExcelSheets(sheets);
						setActiveSheetIndex(0);
						setHtmlContent(sheets[0].html);
					} else {
						setExcelSheets([
							{ name: "Лист 1", html: "<p>Пустой Excel файл</p>" },
						]);
						setHtmlContent("<p>Пустой Excel файл</p>");
					}
				})
				.catch(onFetchError)
				.finally(() => {
					setIsLoading(false);
				});
		} else if (isText) {
			setPreviewType("text");
			setIsLoading(true);
			fetchFileBuffer(file.preview_url, "text")
				.then((response) => {
					setTextContent(String(response.data));
				})
				.catch(onFetchError)
				.finally(() => {
					setIsLoading(false);
				});
		} else {
			setPreviewType("none");
		}

		return () => {
			if (activeUrl) {
				URL.revokeObjectURL(activeUrl);
			}
		};
	}, [file]);

	if (!file) return null;

	const fileType = getFileType(file.extension);

	// Тип поддерживается (не «none»), загрузка завершилась, но контента нет — почти
	// всегда это упавший запрос к файлу (нет API/CORS). Показываем заглушку вместо
	// пустоты. Как только файл начнёт отдаваться — контент появится и заглушка уйдёт.
	const hasPreviewContent =
		!!blobUrl ||
		htmlContent !== null ||
		textContent !== null ||
		pptxSlides.length > 0;
	const showUnavailable =
		!isLoading && previewType !== "none" && !hasPreviewContent;

	const getFormatIcon = (type: string) => {
		const iconSize = 48;
		switch (type) {
			case "pdf":
				return <FileText size={iconSize} className="text-red-500!" />;
			case "spreadsheet":
				return <FileSpreadsheet size={iconSize} className="text-green-500!" />;
			case "presentation":
				return <Presentation size={iconSize} className="text-amber-500!" />;
			case "video":
				return <Video size={iconSize} className="text-violet-500!" />;
			case "image":
				return <ImageIcon size={iconSize} className="text-rose-500!" />;
			case "archive":
				return <Archive size={iconSize} className="text-amber-500!" />;
			case "document":
			default:
				return <FileText size={iconSize} className="text-blue-500!" />;
		}
	};

	const handleDownload = async () => {
		try {
			const downloadUrl = file.download_url || "";
			if (canRenderDirectly(downloadUrl)) {
				const isInline =
					downloadUrl.startsWith("blob:") || downloadUrl.startsWith("data:");
				const link = document.createElement("a");
				link.href = downloadUrl;
				link.download = file.original_name;
				if (!isInline) {
					link.target = "_blank";
					link.rel = "noopener";
				}
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				return;
			}
			const response = await _axios.get(file.download_url, {
				responseType: "blob",
			});
			const blob = new Blob([response.data], {
				type: response.headers["content-type"],
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = file.original_name;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Download failed", error);
			toast.error("Не удалось скачать файл");
		}
	};

	return (
		<div
			className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
			onClick={onClose}
		>
			<div
				className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-[92vw]! xl:max-w-[1600px]! overflow-hidden animate-in fade-in zoom-in duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-2.5">
						<Eye size={18} className="text-indigo-600 dark:text-indigo-400" />
						<h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 truncate max-w-[400px]">
							Просмотр: {file.original_name}
						</h3>
					</div>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
					>
						<X size={20} />
					</button>
				</div>

				<div className="p-8 flex flex-col items-center justify-center min-h-[420px] bg-slate-50/30 dark:bg-slate-900/30">
					<style
						dangerouslySetInnerHTML={{
							__html: `
            .file-preview-paper {
              background: white;
              color: #000;
              width: 100%;
              text-align: left;
            }
            .file-preview-paper.doc-mode {
              font-family: "Times New Roman", serif;
              line-height: 1.5;
            }
            .file-preview-paper.doc-mode p {
              margin-bottom: 12px;
            }
            .file-preview-paper.doc-mode table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .file-preview-paper.doc-mode td,
            .file-preview-paper.doc-mode th {
              border: 1px solid #000;
              padding: 4px;
            }
            .file-preview-paper.xls-mode {
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            .file-preview-paper.xls-mode table {
              border-collapse: collapse;
              width: 100%;
            }
            .file-preview-paper.xls-mode td,
            .file-preview-paper.xls-mode th {
              border: 1px solid #ccc;
              padding: 5px;
              white-space: nowrap;
            }
            .file-preview-paper.xls-mode th {
              background: #f0fdf4;
              font-weight: bold;
              color: #166534;
              text-align: center;
            }
            .file-preview-text {
              white-space: pre-wrap;
              word-break: break-all;
              font-family: monospace;
              font-size: 13px;
            }
          `,
						}}
					/>

					<If is={isLoading}>
						<div className="flex flex-col items-center justify-center space-y-2">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
							<span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
								Загрузка предпросмотра...
							</span>
						</div>
					</If>

					<If is={!isLoading && previewType === "image" && !!blobUrl}>
						<div className="w-full max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-black/5 dark:bg-black/20">
							<img
								src={blobUrl || ""}
								alt={file.original_name}
								className="max-w-full max-h-[70vh] object-contain rounded-2xl"
							/>
						</div>
					</If>

					<If is={!isLoading && previewType === "pdf" && !!blobUrl}>
						<div className="w-full h-[70vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white">
							<iframe
								src={blobUrl || ""}
								title={file.original_name}
								className="w-full h-full border-0 rounded-2xl"
							/>
						</div>
					</If>

					<If is={!isLoading && previewType === "video" && !!blobUrl}>
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

					<If
						is={!isLoading && previewType === "pptx" && pptxSlides.length > 0}
					>
						<div className="w-full flex flex-col items-center gap-4">
							<div className="w-full max-w-[960px] aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-8 flex flex-col justify-between shadow-2xl border border-slate-700/60 relative overflow-hidden">
								<div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
											P
										</div>
										<h4 className="text-lg font-bold text-white tracking-wide truncate max-w-[600px]">
											{pptxSlides[currentSlideIndex]?.title ||
												file.original_name}
										</h4>
									</div>
									<span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400">
										Слайд {currentSlideIndex + 1} из {pptxSlides.length}
									</span>
								</div>

								<div className="flex-1 my-6 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
									<If
										is={Boolean(
											pptxSlides[currentSlideIndex]?.texts.length > 0,
										)}
									>
										{pptxSlides[currentSlideIndex]?.texts.map((txt, idx) => (
											<div
												key={idx}
												className="flex items-start gap-3 text-sm text-slate-200"
											>
												<span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
												<p className="leading-relaxed">{txt}</p>
											</div>
										))}
									</If>
									<If
										is={Boolean(
											!pptxSlides[currentSlideIndex]?.texts ||
											pptxSlides[currentSlideIndex]?.texts.length === 0,
										)}
									>
										<p className="text-sm text-slate-400 italic">
											Содержимое слайда отсутствует или является объектом.
										</p>
									</If>
								</div>

								<div className="flex items-center justify-between pt-3 border-t border-slate-700/50 text-[11px] text-slate-400">
									<span>{file.original_name}</span>
									<span>Презентация PowerPoint</span>
								</div>
							</div>

							<div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
								<button
									type="button"
									onClick={() =>
										setCurrentSlideIndex((prev) => Math.max(0, prev - 1))
									}
									disabled={currentSlideIndex === 0}
									className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
								>
									◀ Предыдущий
								</button>

								<span className="text-xs font-bold text-slate-600 dark:text-zinc-300 px-2">
									{currentSlideIndex + 1} / {pptxSlides.length}
								</span>

								<button
									type="button"
									onClick={() =>
										setCurrentSlideIndex((prev) =>
											Math.min(pptxSlides.length - 1, prev + 1),
										)
									}
									disabled={currentSlideIndex === pptxSlides.length - 1}
									className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
								>
									Следующий ▶
								</button>
							</div>
						</div>
					</If>

					<If is={!isLoading && previewType === "html-doc" && !!htmlContent}>
						<div className="w-full max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white text-left">
							<div
								className="file-preview-paper doc-mode"
								dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
							/>
						</div>
					</If>

					<If is={!isLoading && previewType === "html-xls" && !!htmlContent}>
						<div className="w-full max-h-[70vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white text-left">
							<If is={excelSheets.length > 1}>
								<div className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
									{excelSheets.map((sheet, idx) => (
										<button
											key={idx}
											type="button"
											onClick={() => {
												setActiveSheetIndex(idx);
												setHtmlContent(sheet.html);
											}}
											className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
												activeSheetIndex === idx
													? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm"
													: "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
											}`}
										>
											{sheet.name}
										</button>
									))}
								</div>
							</If>
							<div className="p-6 overflow-auto max-h-[60vh]">
								<div
									className="file-preview-paper xls-mode"
									dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
								/>
							</div>
						</div>
					</If>

					<If is={!isLoading && previewType === "text" && textContent !== null}>
						<div className="w-full max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50 text-left">
							<pre className="file-preview-text text-slate-700 dark:text-zinc-300">
								{textContent}
							</pre>
						</div>
					</If>

					<If is={!isLoading && previewType === "none"}>
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
								{getFormatIcon(fileType)}
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
									Этот тип файла не поддерживает предпросмотр в браузере. Вы
									можете скачать его на свой компьютер для работы.
								</p>
							</div>
						</div>
					</If>

					<If is={!isLoading && showUnavailable}>
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
								{getFormatIcon(fileType)}
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
										"Не удалось загрузить предпросмотр этого файла. Вы можете скачать его на свой компьютер."}
								</p>
							</div>
							<button
								type="button"
								onClick={handleDownload}
								className="px-6 py-2.5 rounded-full text-xs font-bold text-white! bg-indigo-600! hover:bg-indigo-700! transition-colors shadow-lg shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
							>
								<Download size={14} />
								<span>Скачать файл</span>
							</button>
						</div>
					</If>
				</div>

				<div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
					<button
						type="button"
						onClick={onClose}
						className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900"
					>
						Закрыть
					</button>
					<button
						type="button"
						onClick={handleDownload}
						className="px-6 py-2.5 rounded-full text-xs font-bold text-white! bg-indigo-600! hover:bg-indigo-700! transition-colors shadow-lg shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
					>
						<Download size={14} />
						<span>Скачать файл</span>
					</button>
				</div>
			</div>
		</div>
	);
};
