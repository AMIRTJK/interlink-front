import { useMemo } from "react";
import { Button, DatePicker, Form, Select, TimePicker } from "antd";
import { If, TextField } from "@shared/ui";
import { requiredRule, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IRenderFields, TASK_STATUS_OPTIONS } from "../model";
import { transformAssigneesResponse } from "./utils";
import ArrowBottomSuffix from "../../../assets/icons/arrow-bottom-suffix.svg";
import DescriptionIcon from "../../../assets/icons/description-icon.svg";

export const RenderFields = ({
	isEvent,
	isEdit,
	currentTaskStatus,
	isSelectOpen,
	setIsSelectOpen,
	handleChangeStatusSelectOption,
	defaultColor,
	colors,
}: IRenderFields) => {
	const { data: usersData, isFetching: isFetchingUsers } = useGetQuery<any>({
		url: ApiRoutes.GET_USERS,
		params: { per_page: 100 },
		useToken: true,
	});

	const assigneesOptions = useMemo(() => {
		if (!usersData) return [];
		return transformAssigneesResponse(usersData);
	}, [usersData]);
	return (
		<>
			<div className="flex items-center w-full px-6 gap-2 mb-6">
				<TextField
					label=""
					name="title"
					placeholder={isEvent ? "Название мероприятия" : "Название задачи"}
					rules={[requiredRule]}
					customClass="task-form-field flex-1"
					className="border-none! h-10 w-full!"
				/>

				<If is={isEvent}>
					<div
						onClick={handleChangeStatusSelectOption}
						className="flex items-center px-2 shadow-[0_0_20px_rgba(38,51,77,0.08)] h-10 rounded-[30px] w-[100px] bg-white cursor-pointer"
					>
						<Form.Item name="color" noStyle initialValue={defaultColor}>
							<Select
								open={isSelectOpen}
								onDropdownVisibleChange={(visible) => setIsSelectOpen(visible)}
								variant="borderless"
								style={{ width: "100%" }}
								dropdownStyle={{ minWidth: 200 }}
								suffixIcon={<img src={ArrowBottomSuffix} />}
								labelRender={(props) => (
									<div className="flex items-center h-full">
										<div
											style={{
												backgroundColor: String(props.value),
												width: "16px",
												height: "16px",
												borderRadius: "50%",
												border: "1px solid rgba(0,0,0,0.1)",
											}}
										/>
									</div>
								)}
							>
								{colors.map((e, index) => (
									<Select.Option key={index} value={e.value} label={e.value}>
										<div className="flex items-center gap-2">
											<div
												style={{
													backgroundColor: e.value,
													width: "14px",
													height: "14px",
													borderRadius: "50%",
												}}
											/>
											<span>{e.name}</span>
										</div>
									</Select.Option>
								))}
							</Select>
						</Form.Item>
					</div>
				</If>
			</div>
			<div className="flex items-center w-full px-6 gap-2 mb-6">
				<TextField
					prefix={<img src={DescriptionIcon} style={{ marginRight: "15px" }} />}
					name="description"
					placeholder="Описание"
					rules={[requiredRule]}
					customClass="task-form-field flex-1"
					className="border-none! h-10 w-full!"
				/>
			</div>
			<If is={isEvent}>
				<div className="flex items-center w-full px-6 gap-2">
					<Form.Item name="date" style={{ flex: 1 }}>
						<DatePicker
							placeholder="Выберите дату"
							format="DD.MM.YYYY"
							style={{ width: "100%" }}
						/>
					</Form.Item>
					<Form.Item name="time" style={{ flex: 1 }}>
						<TimePicker
							placeholder="Выберите время"
							format="HH:mm"
							style={{ width: "100%" }}
						/>
					</Form.Item>
				</div>
			</If>
			<If is={isEvent}>
				<div className="flex items-center w-full px-6 gap-2">
					<Form.Item name="endTime" style={{ flex: 1 }}>
						<TimePicker
							placeholder="Время окончания"
							format="HH:mm"
							style={{ width: "100%" }}
						/>
					</Form.Item>
				</div>
			</If>
			<div className="flex items-center w-full px-6 gap-2">
				<Form.Item name="assignees" className="mb-5! flex-1" style={{ margin: 0 }}>
					<Select
						placeholder="Выберите исполнителей"
						showSearch
						allowClear
						mode="multiple"
						loading={isFetchingUsers}
						options={assigneesOptions}
						filterOption={(input, option) =>
							(option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
						}
					/>
				</Form.Item>
			</div>
			<If is={!isEvent}>
				<div className="flex items-center w-full px-6 gap-2">
					<Form.Item
						name="status"
						rules={[{ required: true, message: "Выберите статус задачи" }]}
						style={{ flex: 1 }}
					>
						<Select
							placeholder="Выберите статус задачи"
							style={{ width: "100%" }}
							disabled={!!currentTaskStatus}
							options={
								currentTaskStatus
									? TASK_STATUS_OPTIONS.filter(
											(opt) => opt.value === currentTaskStatus,
										)
									: TASK_STATUS_OPTIONS
							}
						/>
					</Form.Item>
				</div>
			</If>
			<div className="flex items-center w-full px-6 gap-2">
				<Button
					type="primary"
					htmlType="submit"
					className="bg-[#0037af]!"
					block
				>
					{isEvent
						? "Добавить событие"
						: isEdit
							? "Редактировать задачу"
							: "Добавить задачу"}
				</Button>
			</div>
		</>
	);
};
