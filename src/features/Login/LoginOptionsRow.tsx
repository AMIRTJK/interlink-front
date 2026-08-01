import { useState } from "react";
import { Modal } from "antd";
import { KeyRound } from "lucide-react";

export const LoginOptionsRow = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpen = () => setIsModalOpen(true);
	const handleClose = () => setIsModalOpen(false);

	return (
		<div className="flex items-center justify-center">
			<button
				type="button"
				onClick={handleOpen}
				className="text-sm text-blue-400 cursor-pointer hover:text-blue-300 font-medium transition-colors"
			>
				Забыли пароль?
			</button>

			<Modal
				open={isModalOpen}
				onOk={handleClose}
				onCancel={handleClose}
				okText="Понятно"
				cancelButtonProps={{ style: { display: "none" } }}
				centered
				title={
					<div className="flex items-center gap-2.5 text-white">
						<KeyRound className="w-5 h-5 text-blue-500" />
						<span>Восстановление доступа</span>
					</div>
				}
				okButtonProps={{
					className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none rounded-xl h-10 px-6 font-medium transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98]",
				}}
			>
				<div className="py-4 text-slate-300 text-[15px] leading-relaxed">
					Для восстановления доступа или сброса пароля, пожалуйста, обратитесь к системному администратору.
				</div>
			</Modal>
		</div>
	);
};
