import { Modal, Form, Input, Button } from "antd";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { SelectField } from "@shared/ui";
import { CreatePermissionAndRoleDTO } from "@entities/hr";
import { PERMISSION_TRANSLATIONS, SUPPLEMENTARY_PERMISSIONS } from "../../../../features/Hr/model";

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
			success: "\u0420\u043e\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0437\u0434\u0430\u043d\u0430",
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
					<div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
						+
					</div>
					<div>
						<p className="text-base font-bold text-slate-800 leading-tight">
							{"\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u043d\u043e\u0432\u043e\u0439 \u0440\u043e\u043b\u0438"}
						</p>
						<p className="text-xs text-slate-400">{"\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u0438\u043c\u0435\u043d\u0438 \u0438 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0445 \u043f\u0440\u0430\u0432"}</p>
					</div>
				</div>
			}
		>
			<Form form={form} layout="vertical" onFinish={onFinish} className="pt-4">
				<Form.Item
					name="name"
					label={"\u0418\u043c\u044f \u0440\u043e\u043b\u0438"}
					rules={[{ required: true, message: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435" }]}
				>
					<Input placeholder="manager" />
				</Form.Item>
				<SelectField
					name="permissions"
					label={"\u041f\u0440\u0430\u0432\u0430 \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e"}
					rules={[{ required: true, message: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u0430\u0432\u0430" }]}
					method="GET"
					url={ApiRoutes.FETCH_PERMISSIONS}
					isFetchAllowed={true}
					transformResponse={transformPermissions}
					placeholder={"\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u0430\u0432\u0430"}
					mode="multiple"
				/>
				<div className="flex items-center justify-end gap-2 pt-4">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
					>
						{"\u041e\u0442\u043c\u0435\u043d\u0430"}
					</button>
					<Button
						type="primary"
						htmlType="submit"
						loading={isPending}
						className="px-5 py-2 h-auto! rounded-lg! text-sm! font-semibold!"
					>
						{"\u0421\u043e\u0437\u0434\u0430\u0442\u044c"}
					</Button>
				</div>
			</Form>
		</Modal>
	);
};
