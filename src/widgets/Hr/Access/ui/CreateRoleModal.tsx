import { Modal, Form, Input, Button } from "antd";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { SelectField } from "@shared/ui";
import { CreatePermissionAndRoleDTO } from "@entities/hr";
import {
	PERMISSION_TRANSLATIONS,
	SUPPLEMENTARY_PERMISSIONS,
} from "../../../../features/Hr/model";

interface IProps {
	open: boolean;
	onClose: () => void;
}

export const CreateRoleModal = ({ open, onClose }: IProps) => {
	const [form] = Form.useForm();
	const { mutate, isPending } = useMutationQuery<CreatePermissionAndRoleDTO>({
		url: ApiRoutes.CREATE_ROLE,
		method: "POST",
		messages: {
			success: "Роль успешно создана",
			invalidate: [ApiRoutes.GET_ROLES],
		},
	});

	const transformPermissions = (response: any) => {
		const data = response?.data || response || [];
		const serverItems = data.map((p: any) => ({
			value: p.name,
			label: PERMISSION_TRANSLATIONS[p.name] || p.label || p.name,
		}));
		return [...serverItems, ...SUPPLEMENTARY_PERMISSIONS];
	};

	const onFinish = (values: any) => {
		mutate(values, {
			onSuccess: () => {
				form.resetFields();
				onClose();
			},
		});
	};

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			width={500}
			destroyOnClose
			title={
				<div className="flex items-center gap-3">
					<div>
						<p className="text-base font-bold text-slate-800 leading-tight">
							{"Создание новой роли"}
						</p>
						<p className="text-xs text-slate-400">
							{"Настройка имени и начальных прав"}
						</p>
					</div>
				</div>
			}
		>
			<Form form={form} layout="vertical" onFinish={onFinish} className="pt-4">
				<Form.Item
					name="name"
					label={"Имя роли"}
					rules={[{ required: true, message: "Введите название" }]}
				>
					<Input placeholder="manager" />
				</Form.Item>
				<SelectField
					name="permissions"
					label={"Права по умолчанию"}
					rules={[{ required: true, message: "Выберите права" }]}
					method="GET"
					url={ApiRoutes.FETCH_PERMISSIONS}
					isFetchAllowed={true}
					transformResponse={transformPermissions}
					placeholder={"Выберите права"}
					mode="multiple"
				/>
				<div className="flex items-center justify-end gap-2 pt-4">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
					>
						{"Отмена"}
					</button>
					<Button
						type="primary"
						htmlType="submit"
						loading={isPending}
						className="px-5 py-2 h-auto! rounded-lg! text-sm! font-semibold!"
					>
						{"Создать"}
					</Button>
				</div>
			</Form>
		</Modal>
	);
};

