import { _axios } from "@shared/api";

export const IMAGE_EXTENSIONS = [
	"png",
	"jpg",
	"jpeg",
	"gif",
	"webp",
	"svg",
	"bmp",
	"ico",
];

export const DOCX_EXTENSIONS = ["docx", "doc", "rtf", "odt", "dotx"];
export const XLSX_EXTENSIONS = ["xlsx", "xls", "csv", "ods", "xlsb", "xlsm"];
export const PPTX_EXTENSIONS = ["pptx", "ppt", "potx", "ppsx", "odp"];
export const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "mkv", "avi", "m4v"];
export const TEXT_EXTENSIONS = [
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
];

export const fetchFileBuffer = async (
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

export const canRenderDirectly = (url?: string): boolean => {
	if (!url) {
		return false;
	}
	return /^(blob:|data:)/i.test(url) || !url.includes("/api/");
};
