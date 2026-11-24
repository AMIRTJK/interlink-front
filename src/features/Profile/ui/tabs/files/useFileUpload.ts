import { useCallback, useRef, useState } from "react";
import type { AxiosProgressEvent } from "axios";
import { useMutationQuery } from "@shared/lib";
import { toast } from "@shared/lib/toast";
import { ApiRoutes } from "@shared/api";
import type { IApiFile } from "./lib";
import {
	UPLOAD_COMPLETE_PERCENT,
	UPLOAD_FILES_FIELD,
	UPLOAD_FOLDER_FIELD,
	UPLOAD_TEXTS,
	type IUploadFileRequest,
	type IUploadingFile,
} from "./fileUploadModel";

const buildUploadFormData = (file: File, folderId: number | "all") => {
	const formData = new FormData();
	formData.append(UPLOAD_FILES_FIELD, file);
	if (typeof folderId === "number") {
		formData.append(UPLOAD_FOLDER_FIELD, String(folderId));
	}
	return formData;
};

const getUploadPercent = (event: AxiosProgressEvent): number | null => {
	if (!event.total) return null;
	return Math.min(
		UPLOAD_COMPLETE_PERCENT,
		Math.round((event.loaded / event.total) * UPLOAD_COMPLETE_PERCENT),
	);
};

const transformUploadBody = (data: IUploadFileRequest) => data.formData;

const uploadRequestConfig = (data: IUploadFileRequest) => ({
	onUploadProgress: (event: AxiosProgressEvent) =>
		data.onProgress(getUploadPercent(event)),
});

/**
 * Загрузка файлов в личное хранилище с индикацией: по запросу на файл, чтобы
 * у каждого был свой прогресс. Пока пачка не завершилась, новая не стартует.
 */
export const useFileUpload = (activeFolderId: number | "all") => {
	const [uploads, setUploads] = useState<IUploadingFile[]>([]);
	// Состояние обновляется асинхронно, поэтому двойной клик или drop в том же
	// тике проверяем по ref, а не по uploads.
	const isBusyRef = useRef(false);
	const nextIdRef = useRef(0);

	const { mutateAsync } = useMutationQuery<IUploadFileRequest, IApiFile>({
		url: ApiRoutes.MY_FILES_UPLOAD,
		method: "POST",
		transformBody: transformUploadBody,
		requestConfig: uploadRequestConfig,
		messages: {
			suppressSuccessToast: true,
			invalidate: [ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
		},
	});

	const setProgress = useCallback((id: string, progress: number | null) => {
		setUploads((prev) =>
			prev.map((item) =>
				item.id === id && item.progress !== progress
					? { ...item, progress }
					: item,
			),
		);
	}, []);

	const removeUpload = useCallback((id: string) => {
		setUploads((prev) => prev.filter((item) => item.id !== id));
	}, []);

	const uploadFiles = useCallback(
		async (files: File[]) => {
			if (isBusyRef.current || files.length === 0) return;
			isBusyRef.current = true;

			const items: IUploadingFile[] = files.map((file) => {
				nextIdRef.current += 1;
				return {
					id: `upload-${nextIdRef.current}`,
					name: file.name,
					size: file.size,
					progress: null,
				};
			});
			setUploads(items);

			// Ошибки показывает тостом сам useMutationQuery, здесь их только гасим,
			// чтобы одна неудача не обрывала остальные загрузки пачки.
			const results = await Promise.allSettled(
				files.map((file, index) => {
					const { id } = items[index];
					return mutateAsync({
						formData: buildUploadFormData(file, activeFolderId),
						onProgress: (percent) => setProgress(id, percent),
					}).finally(() => removeUpload(id));
				}),
			);

			isBusyRef.current = false;

			const uploadedCount = results.filter(
				(result) => result.status === "fulfilled",
			).length;
			if (uploadedCount === 1) toast.success(UPLOAD_TEXTS.single);
			if (uploadedCount > 1) toast.success(UPLOAD_TEXTS.many(uploadedCount));
		},
		[activeFolderId, mutateAsync, setProgress, removeUpload],
	);

	return {
		uploads,
		isUploading: uploads.length > 0,
		uploadFiles,
	};
};
