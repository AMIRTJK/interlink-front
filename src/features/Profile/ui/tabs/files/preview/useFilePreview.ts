import { useState, useEffect } from "react";
import { IApiFile } from "../lib";
import { IPptxSlide, IExcelSheet, TPreviewType } from "./types";
import {
	IMAGE_EXTENSIONS,
	DOCX_EXTENSIONS,
	XLSX_EXTENSIONS,
	PPTX_EXTENSIONS,
	VIDEO_EXTENSIONS,
	TEXT_EXTENSIONS,
	fetchFileBuffer,
	canRenderDirectly,
} from "./lib";
import { parsePptx } from "./parsePptx";
import { parseDocx, parseXlsx, parseText, downloadFile } from "./fileParsers";

export const useFilePreview = (file: IApiFile | null) => {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [htmlContent, setHtmlContent] = useState<string | null>(null);
	const [textContent, setTextContent] = useState<string | null>(null);
	const [pptxSlides, setPptxSlides] = useState<IPptxSlide[]>([]);
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
	const [excelSheets, setExcelSheets] = useState<IExcelSheet[]>([]);
	const [activeSheetIndex, setActiveSheetIndex] = useState(0);
	const [previewType, setPreviewType] = useState<TPreviewType>("none");
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
		const isImage = IMAGE_EXTENSIONS.includes(ext);
		const isPdf = ext === "pdf";
		const isDocx = DOCX_EXTENSIONS.includes(ext);
		const isXlsx = XLSX_EXTENSIONS.includes(ext);
		const isPptx = PPTX_EXTENSIONS.includes(ext);
		const isVideo = VIDEO_EXTENSIONS.includes(ext);
		const isText = TEXT_EXTENSIONS.includes(ext);

		let activeUrl: string | null = null;

		const onFetchError = (err: unknown) => {
			console.error("Не удалось загрузить предпросмотр вложения", err);
		};

		if (isImage || isPdf || isVideo) {
			setPreviewType(isImage ? "image" : isPdf ? "pdf" : "video");
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
					.finally(() => setIsLoading(false));
			}
		} else if (isPptx) {
			setPreviewType("pptx");
			setIsLoading(true);
			parsePptx(file.preview_url || "", file.original_name)
				.then((slides) => {
					setPptxSlides(slides);
					setCurrentSlideIndex(0);
				})
				.catch(onFetchError)
				.finally(() => setIsLoading(false));
		} else if (isDocx) {
			setPreviewType("html-doc");
			setIsLoading(true);
			parseDocx(file.preview_url || "")
				.then((html) => setHtmlContent(html))
				.catch(onFetchError)
				.finally(() => setIsLoading(false));
		} else if (isXlsx) {
			setPreviewType("html-xls");
			setIsLoading(true);
			parseXlsx(file.preview_url || "")
				.then((sheets) => {
					setExcelSheets(sheets);
					setActiveSheetIndex(0);
					setHtmlContent(sheets[0]?.html || "");
				})
				.catch(onFetchError)
				.finally(() => setIsLoading(false));
		} else if (isText) {
			setPreviewType("text");
			setIsLoading(true);
			parseText(file.preview_url || "")
				.then((txt) => setTextContent(txt))
				.catch(onFetchError)
				.finally(() => setIsLoading(false));
		} else {
			setPreviewType("none");
		}

		return () => {
			if (activeUrl) {
				URL.revokeObjectURL(activeUrl);
			}
		};
	}, [file]);

	const handleDownload = () => {
		if (file) {
			downloadFile(file);
		}
	};

	const hasPreviewContent =
		!!blobUrl ||
		htmlContent !== null ||
		textContent !== null ||
		pptxSlides.length > 0;

	const showUnavailable =
		!isLoading && previewType !== "none" && !hasPreviewContent;

	return {
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
	};
};
