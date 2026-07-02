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
				className="mb-3!"
			>
				<Input
					placeholder="Например: Встреча с командой"
					className="w-full! bg-zinc-100! hover:bg-zinc-200/70! focus:bg-zinc-50! shadow-none! border! border-zinc-200! focus:border-zinc-400! rounded-2xl! h-10! px-4! transition-all! duration-200! text-sm! text-zinc-700!"
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
				className="mb-3!"
			>
				<DatePicker
					format="DD.MM.YYYY"
					placeholder="Выберите дату"
					className="w-full! bg-zinc-100! hover:bg-zinc-200/70! border! border-zinc-200! focus:border-zinc-400! rounded-2xl! h-10! px-4! transition-all! duration-200! text-sm!"
				/>
			</Form.Item>

			<div className="grid! grid-cols-2! gap-3! mb-3!">
				<Form.Item
					label={
						<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider!">
							Начало
						</span>
					}
					name="time"
					rules={[{ required: true, message: "Выберите время" }]}
					className="mb-0!"
				>
					<TimePicker
						format="HH:mm"
						placeholder="10:00"
						className="w-full! bg-zinc-100! hover:bg-zinc-200/70! border! border-zinc-200! focus:border-zinc-400! rounded-2xl! h-10! px-4! transition-all! duration-200! text-sm!"
					/>
				</Form.Item>

				<Form.Item
					label={
						<span className="text-[11px]! font-extrabold! text-zinc-400! uppercase! tracking-wider!">
							Конец
						</span>
					}
					name="endTime"
					className="mb-0!"
				>
					<TimePicker
						format="HH:mm"
						placeholder="11:00"
						className="w-full! bg-zinc-100! hover:bg-zinc-200/70! border! border-zinc-200! focus:border-zinc-400! rounded-2xl! h-10! px-4! transition-all! duration-200! text-sm!"
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
				className="mb-3!"
			>
				<div className="flex! items-center! gap-3!">
					{colors.map((c) => {
						const active = activeColor === c.value;
						return (
							<button
								key={c.value}
								type="button"
								onClick={() => form.setFieldValue("color", c.value)}
								className="w-9! h-9! rounded-full! flex! items-center! justify-center! cursor-pointer! transition-all! duration-200! border-none! outline-none! p-0!"
								style={{
									backgroundColor: c.value,
									boxShadow: active
										? `0 0 0 2px #fff, 0 0 0 4px ${c.ring}`
										: "none",
									transform: active ? "scale(1.1)" : "scale(1)",
								}}
							>
								<If is={active}>
									<CheckOutlined className="text-white! text-xs! font-bold!" />
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
				className="mb-3!"
			>
				<Select
					mode="multiple"
					placeholder="Добавить участника..."
					loading={isFetchingUsers}
					options={assigneesOptions}
					variant="outlined"
					className="w-full! bg-zinc-100! hover:bg-zinc-200/70! border! border-zinc-200! focus:border-zinc-400! rounded-2xl! min-h-[40px]! px-1! transition-all! duration-200! text-sm!"
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
				className="mb-2!"
			>
				<Input.TextArea
					placeholder="Детали события..."
					autoSize={{ minRows: 3, maxRows: 6 }}
					className="w-full! bg-zinc-100! p-3! hover:bg-zinc-200/70! focus:bg-zinc-50! border! border-zinc-200! focus:border-zinc-400! rounded-2xl! transition-all! duration-200! text-sm! text-zinc-700!"
				/>
			</Form.Item>
		</>
	);
};

