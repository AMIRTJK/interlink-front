import { Modal, Form, Input, Button } from "antd";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";

interface IProps {
	open: boolean;
	onClose: () => void;
}

/** UI-права создаются только с префиксом "ui." — backend отклонит любое другое имя */
export const CreateUiPermissionModal = ({ open, onClose }: IProps) => {
	const [form] = Form.useForm();

	const { mutate, isPending } = useMutationQuery<{ name: string }>({
		url: ApiRoutes.CREATE_PERMISSION,
		method: "POST",
		messages: {
			success: "UI-право успешно создано",
			invalidate: [ApiRoutes.FETCH_PERMISSIONS],
		},
	});

	const onFinish = (values: { name: string }) => {
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
			width={440}
			destroyOnClose
			transitionName=""
			maskTransitionName=""
			title={
				<div>
					<p className="text-base font-bold text-slate-800 leading-tight">
						{"Создание UI-права"}
					</p>
					<p className="text-xs text-slate-400">
						{"Кастомное право для интерфейса, не влияет на серверные проверки"}
					</p>
				</div>
			}
		>
			<Form form={form} layout="vertical" onFinish={onFinish} className="pt-4">
				<Form.Item
					name="name"
					label={"Название права"}
					rules={[
						{ required: true, message: "Введите название" },
						{
							pattern: /^ui\.[a-z0-9_-]+(\.[a-z0-9_-]+)*$/,
							message: "Должно начинаться с \"ui.\" и содержать только латиницу, цифры, . _ -",
						},
					]}
				>
					<Input placeholder="ui.analytics.view" />
				</Form.Item>
				<div className="flex items-center justify-end gap-2 pt-2">
					<Button
						type="primary"
						htmlType="submit"
						loading={isPending}
						className="px-5! py-2! h-auto! rounded-lg! text-sm! font-semibold!"
					>
						{"Создать"}
					</Button>
				</div>
			</Form>
		</Modal>
	);
};
