import React from "react";
import { Form, Input, DatePicker, TimePicker, Select } from "antd";
import { CheckOutlined, TeamOutlined } from "@ant-design/icons";
import { If } from "@shared/ui";
import type { FormInstance } from "antd";

interface IEventFormFieldsProps {
	form: FormInstance;
	activeColor?: string;
	isFetchingUsers: boolean;
	assigneesOptions: { value: number; label: string }[];
}

const colors = [
	{ name: "Синий", value: "#33BFFF", ring: "#33BFFF" },
	{ name: "Красный", value: "#E62E7B", ring: "#E62E7B" },
	{ name: "Зеленый", value: "#29CC39", ring: "#29CC39" },
	{ name: "Оранжевый", value: "#FF6633", ring: "#FF6633" },
	{ name: "Пурпурный", value: "#8833FF", ring: "#8833FF" },
];

export const EventFormFields = ({
	form,
	activeColor,
	isFetchingUsers,
	assigneesOptions,
}: IEventFormFieldsProps) => {
	return (
		<>
			<Form.Item
				label={
					<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider!">
						Название события
					</span>
				}
				name="title"
				rules={[{ required: true, message: "Введите название события" }]}
			>
				<Input
					placeholder="Например: Встреча с командой"
					className="w-full! bg-zinc-100/70! hover:bg-zinc-200/50! focus:bg-white! border-none! rounded-[1.25rem]! h-11! px-4! transition-all! text-sm!"
				/>
			</Form.Item>

			<Form.Item
				label={
					<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider!">
						Дата
					</span>
				}
				name="date"
				rules={[{ required: true, message: "Выберите дату" }]}
			>
				<DatePicker
					format="DD.MM.YYYY"
					placeholder="Выберите дату"
					className="w-full! bg-zinc-100/70! hover:bg-zinc-200/50! focus:bg-white! border-none! rounded-[1.25rem]! h-11! px-4! transition-all! text-sm!"
				/>
			</Form.Item>

			<div className="grid! grid-cols-2! gap-4!">
				<Form.Item
					label={
						<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider!">
							Начало
						</span>
					}
					name="time"
					rules={[{ required: true, message: "Выберите время" }]}
				>
					<TimePicker
						format="HH:mm"
						placeholder="10:00"
						className="w-full! bg-zinc-100/70! hover:bg-zinc-200/50! focus:bg-white! border-none! rounded-[1.25rem]! h-11! px-4! transition-all! text-sm!"
					/>
				</Form.Item>

				<Form.Item
					label={
						<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider!">
							Конец
						</span>
					}
					name="endTime"
				>
					<TimePicker
						format="HH:mm"
						placeholder="11:00"
						className="w-full! bg-zinc-100/70! hover:bg-zinc-200/50! focus:bg-white! border-none! rounded-[1.25rem]! h-11! px-4! transition-all! text-sm!"
					/>
				</Form.Item>
			</div>

			<Form.Item
				label={
					<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider!">
						Цвет
					</span>
				}
				name="color"
			>
				<div className="flex! items-center! gap-3!">
					{colors.map((c) => {
						const active = activeColor === c.value;
						return (
							<button
								key={c.value}
								type="button"
								onClick={() => form.setFieldValue("color", c.value)}
								className="w-10! h-10! rounded-full! flex! items-center! justify-center! cursor-pointer! transition-all! border-none! outline-none! p-0!"
								style={{
									backgroundColor: c.value,
									boxShadow: active
										? `0 0 0 2px #fff, 0 0 0 4px ${c.ring}`
										: "none",
									transform: active ? "scale(1.1)" : "scale(1)",
								}}
							>
								<If is={active}>
									<CheckOutlined className="text-white! text-sm! font-bold!" />
								</If>
							</button>
						);
					})}
				</div>
			</Form.Item>

			<Form.Item
				label={
					<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider! flex! items-center! gap-1!">
						<TeamOutlined className="text-zinc-400! text-xs!" />
						Участники / исполнители
					</span>
				}
				name="assignees"
			>
				<Select
					mode="multiple"
					placeholder="Добавить участника..."
					loading={isFetchingUsers}
					options={assigneesOptions}
					variant="borderless"
					className="w-full! bg-zinc-100/70! hover:bg-zinc-200/50! rounded-[1.25rem]! min-h-[44px]! px-2! py-1! transition-all! text-sm!"
					filterOption={(input, option) =>
						(option?.label ?? "")
							.toString()
							.toLowerCase()
							.includes(input.toLowerCase())
					}
				/>
			</Form.Item>

			<Form.Item
				label={
					<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider!">
						Описание (необязательно)
					</span>
				}
				name="description"
			>
				<Input.TextArea
					placeholder="Детали события..."
					autoSize={{ minRows: 3, maxRows: 6 }}
					className="w-full! bg-zinc-100/70! hover:bg-zinc-200/50! focus:bg-white! border-none! rounded-[1.25rem]! transition-all! text-sm!"
				/>
			</Form.Item>
		</>
	);
};

