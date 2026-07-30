import { getEnvVar } from "@shared/config";

export const MAX_PHOTO_SIZE_MB = 5;

export const NOT_SET = "Не указано";

export const resolvePhotoUrl = (path?: string | null): string => {
	if (!path) return "";
	if (
		path.startsWith("http://") ||
		path.startsWith("https://") ||
		path.startsWith("data:")
	) {
		return path;
	}
	const apiHost = getEnvVar("VITE_API_URL") || "";
	const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
	let p = path.replace(/^\/+/, "");
	if (!p.startsWith("storage/")) p = `storage/${p}`;
	return `${host}/${p}`;
};

export const orDash = (value?: string | null): string =>
	value && String(value).trim() ? String(value) : NOT_SET;

export const formatDate = (iso?: string | null): string => {
	if (!iso) return NOT_SET;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return NOT_SET;
	return d.toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
};
