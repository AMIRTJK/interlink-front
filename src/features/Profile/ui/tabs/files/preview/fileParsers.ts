import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { _axios } from "@shared/api";
import { toast } from "@shared/lib/toast";
import { fetchFileBuffer, canRenderDirectly } from "./lib";
import { IExcelSheet } from "./types";
import { IApiFile } from "../lib";

export const parseDocx = async (url: string): Promise<string> => {
	const response = await fetchFileBuffer(url, "blob");
	const arrayBuffer = await response.data.arrayBuffer();
	const result = await mammoth.convertToHtml({ arrayBuffer });
	return result.value || "<p>Пустой документ</p>";
};

export const parseXlsx = async (url: string): Promise<IExcelSheet[]> => {
	const response = await fetchFileBuffer(url, "blob");
	const arrayBuffer = await response.data.arrayBuffer();
	const workbook = XLSX.read(arrayBuffer, { type: "array" });
	if (workbook.SheetNames.length > 0) {
		return workbook.SheetNames.map((sheetName) => ({
			name: sheetName,
			html: XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]),
		}));
	}
	return [{ name: "Лист 1", html: "<p>Пустой Excel файл</p>" }];
};

export const parseText = async (url: string): Promise<string> => {
	const response = await fetchFileBuffer(url, "text");
	return String(response.data);
};

export const downloadFile = async (file: IApiFile): Promise<void> => {
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
