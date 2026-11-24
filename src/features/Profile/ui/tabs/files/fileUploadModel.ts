export interface IUploadingFile {
	id: string;
	name: string;
	size: number;
	/** null — сервер не сообщил общий размер, показываем неопределённый спиннер. */
	progress: number | null;
}

export interface IUploadFileRequest {
	formData: FormData;
	onProgress: (percent: number | null) => void;
}

export const UPLOAD_FILES_FIELD = "files[]";
export const UPLOAD_FOLDER_FIELD = "folder_id";
export const UPLOAD_COMPLETE_PERCENT = 100;

export const UPLOAD_TEXTS = {
	single: "Файл успешно загружен",
	many: (count: number) => `Загружено файлов: ${count}`,
	uploading: "Загрузка…",
	processing: "Обработка на сервере…",
	dropzoneBusy: "Идёт загрузка файлов, дождитесь завершения",
} as const;
