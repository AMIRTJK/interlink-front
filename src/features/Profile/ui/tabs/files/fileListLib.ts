import { _axios } from "@shared/api";
import { toast } from "@shared/lib/toast";
import type { IApiFile } from "./lib";

export const downloadFile = async (file: IApiFile) => {
	try {
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

export const formatFileDate = (dateStr: string) => {
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};
