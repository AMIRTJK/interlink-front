import React, { useMemo, useEffect, useState } from "react";
import { Modal, Form, ConfigProvider } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { transformAssigneesResponse } from "../tasks/lib/utils";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { EventFormFields } from "./ui/EventFormFields";
import dayjs, { Dayjs } from "dayjs";
import "./create-event-modal.css";

interface IProps {
	isOpen: boolean;
	onClose: () => void;
	selectedDateTime?: { date: Dayjs; time: Dayjs } | null;
	onSuccess: () => void;
	mode?: "create" | "edit";
	eventId?: string;
}

export const CreateTaskModal = ({
	isOpen,
	onClose,
	selectedDateTime,
	onSuccess,
	mode = "create",
	eventId,
}: IProps) => {
	const [form] = Form.useForm();
	const activeColor = Form.useWatch("color", form);
	const [themeKey, setThemeKey] = useState(
		() => localStorage.getItem("currentTheme") || "emerald",
	);
	const activeTheme = THEMES[themeKey] || THEMES.emerald;

	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === "currentTheme" && e.newValue) {
				setThemeKey(e.newValue);
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const { data: usersData, isFetching: isFetchingUsers } = useGetQuery<any>({
		url: ApiRoutes.GET_USERS,
		params: { per_page: 100 },
		useToken: true,
	});

	const assigneesOptions = useMemo(() => {
		if (!usersData) return [];
		return transformAssigneesResponse(usersData);
	}, [usersData]);

	const { mutate: addEventMutate } = useMutationQuery({
		method: mode === "edit" ? "PUT" : "POST",
		url:
			mode === "edit" && eventId
				? `${ApiRoutes.UPDATE_EVENT}/${eventId}`
				: ApiRoutes.ADD_EVENT,
		messages: {
			success: mode === "edit" ? "Событие обновлено!" : "Событие добавлено!",
			error:
				mode === "edit"
					? "Ошибка при обновлении события"
					: "Ошибка при добавлении события",
			invalidate: [ApiRoutes.GET_EVENTS],
			onSuccessCb: () => {
				onSuccess();
			},
		},
	});

	const onFinish = (values: any) => {
		const dateStr = values.date?.format("YYYY-MM-DD");
		const timeStr = values.time?.format("HH:mm");
		const startDateTime = dayjs(`${dateStr} ${timeStr}`);

		let endDateTime;
		if (values.endTime) {
			const endTimeStr = values.endTime.format("HH:mm");
			endDateTime = dayjs(`${dateStr} ${endTimeStr}`);
			if (
				endDateTime.isBefore(startDateTime) ||
				endDateTime.isSame(startDateTime)
			) {
				endDateTime = endDateTime.add(1, "day");
			}
		} else {
			endDateTime = startDateTime.add(1, "hour");
		}

		addEventMutate({
			title: values.title,
			description: values.description || "",
			start_at: startDateTime.format("YYYY-MM-DD HH:mm"),
			end_at: endDateTime.format("YYYY-MM-DD HH:mm"),
			color: String(values.color),
			status: "pending",
			participants: values.assignees || [],
		});
	};

	const combinedInitialValues = useMemo(() => {
		if (selectedDateTime) {
			return {
				date: selectedDateTime.date,
				time: selectedDateTime.time,
				endTime: selectedDateTime.time.add(1, "hour"),
				color: "#33BFFF",
			};
		}
		return { color: "#33BFFF" };
	}, [selectedDateTime]);

	useEffect(() => {
		if (isOpen) {
			form.setFieldsValue(combinedInitialValues);
		} else {
			form.resetFields();
		}
	}, [combinedInitialValues, isOpen, form]);

	return (
		<ConfigProvider
			theme={{
				components: {
					Modal: {
						paddingMD: 0,
						paddingContentHorizontalLG: 0,
					},
				},
			}}
		>
			<Modal
				open={isOpen}
				onCancel={onClose}
				footer={null}
				width={480}
				centered
				closable={false}
				className="create-event-modal"
				style={{ borderRadius: 20, overflow: "hidden" }}
				styles={{ body: { padding: 0 } }}
			>
				<div
					className={`bg-linear-to-r! ${activeTheme.gradient} px-6! py-4! flex! items-center! justify-between!`}
				>
					<h3 className="text-white! font-bold! text-base! m-0!">
						{mode === "edit" ? "Редактирование события" : "Новое событие"}
					</h3>
					<button
						onClick={onClose}
						className="text-white/80! hover:text-white! text-base! cursor-pointer! border-none! bg-transparent! flex! items-center! justify-center! transition-colors! leading-none! p-0!"
					>
						✕
					</button>
				</div>

				<Form
					form={form}
					layout="vertical"
					onFinish={onFinish}
					className="px-5! pt-4! pb-2!"
					requiredMark={false}
				>
					<EventFormFields
						form={form}
						activeColor={activeColor}
						isFetchingUsers={isFetchingUsers}
						assigneesOptions={assigneesOptions}
					/>

					<div className="border-t! border-zinc-100! mt-2! pt-3! pb-2! flex! items-center! justify-end! gap-3!">
						<button
							type="button"
							onClick={onClose}
							className="text-zinc-500! hover:text-zinc-800! font-medium! text-sm! cursor-pointer! border-none! bg-transparent! transition-colors! px-4! py-2!"
						>
							Отмена
						</button>
						<button
							type="submit"
							className={`bg-linear-to-r! ${activeTheme.gradient} text-white! font-bold! text-sm! px-7! py-2! rounded-full! cursor-pointer! shadow-md! border-none! hover:opacity-90! transition-opacity!`}
						>
							{mode === "edit" ? "Сохранить" : "Создать"}
						</button>
					</div>
				</Form>
			</Modal>
		</ConfigProvider>
	);
};
