import { useState, useMemo } from "react";
import { Modal, Input } from "antd";
import {
	FlaskConical,
	Search,
	User,
	Phone,
	Briefcase,
	Building2,
	Check,
} from "lucide-react";
import {
	DEV_TEST_ACCOUNTS,
	extractTestPhoneLocal,
	type ITestAccount,
} from "./testAccountsData";

interface IProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectAccount: (phone: string) => void;
}

export const DevTestAccountsModal = ({
	isOpen,
	onClose,
	onSelectAccount,
}: IProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredAccounts = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return DEV_TEST_ACCOUNTS;

		return DEV_TEST_ACCOUNTS.filter((account) => {
			const localPhone = extractTestPhoneLocal(account.phone);
			return (
				account.fullName.toLowerCase().includes(query) ||
				account.position.toLowerCase().includes(query) ||
				account.phone.includes(query) ||
				localPhone.includes(query) ||
				(account.role && account.role.toLowerCase().includes(query)) ||
				(account.department && account.department.toLowerCase().includes(query))
			);
		});
	}, [searchQuery]);

	const handleSelect = (account: ITestAccount) => {
		onSelectAccount(account.phone);
		onClose();
	};

	return (
		<Modal
			open={isOpen}
			onCancel={onClose}
			footer={null}
			centered
			width={640}
			destroyOnClose
			title={
				<div className="flex items-center gap-3 text-white pb-1">
					<div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
						<FlaskConical className="w-5 h-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-semibold text-lg">Тестовые аккаунты</span>
							<span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
								DEV ONLY
							</span>
						</div>
						<p className="text-xs text-slate-400 font-normal">
							Выберите пользователя для автоподстановки номера (без +992)
						</p>
					</div>
				</div>
			}
		>
			<div className="space-y-4 pt-3">
				{/* Search Input */}
				<Input
					prefix={<Search className="w-4 h-4 text-slate-400 mr-1.5" />}
					placeholder="Поиск по ФИО, должности, телефону..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					allowClear
					className="h-10 rounded-xl bg-slate-900/40 border-white/15 text-white"
				/>

				{/* Total count */}
				<div className="flex items-center justify-between text-xs text-slate-400 px-1">
					<span>Доступно для быстрого входа:</span>
					<span>
						Показано {filteredAccounts.length} из {DEV_TEST_ACCOUNTS.length}
					</span>
				</div>

				{/* List */}
				<div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1.5 custom-scrollbar">
					{filteredAccounts.length === 0 ? (
						<div className="py-12 text-center text-slate-400">
							<User className="w-10 h-10 mx-auto text-slate-600 mb-2" />
							<p className="text-sm">Пользователи не найдены</p>
						</div>
					) : (
						filteredAccounts.map((account) => {
							const localPhone = extractTestPhoneLocal(account.phone);
							return (
								<button
									key={account.id}
									type="button"
									onClick={() => handleSelect(account)}
									className="w-full text-left p-3 rounded-2xl bg-slate-900/30 hover:bg-blue-600/15 border border-white/10 hover:border-blue-500/40 transition-all group flex items-center justify-between gap-3 cursor-pointer"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div className="w-10 h-10 shrink-0 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 font-semibold group-hover:bg-blue-500/20 group-hover:text-blue-300 group-hover:border-blue-500/30 transition-colors">
											{account.fullName.charAt(0)}
										</div>

										<div className="min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="font-semibold text-sm text-slate-100 group-hover:text-blue-300 transition-colors truncate">
													{account.fullName}
												</span>
												{account.role && (
													<span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-800 text-slate-400 border border-white/10">
														{account.role}
													</span>
												)}
											</div>

											<div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
												<span className="flex items-center gap-1">
													<Briefcase className="w-3 h-3 text-slate-500" />
													<span className="truncate max-w-[150px]">
														{account.position}
													</span>
												</span>
												{account.department && (
													<span className="flex items-center gap-1 hidden sm:flex">
														<Building2 className="w-3 h-3 text-slate-500" />
														<span className="truncate max-w-[140px]">
															{account.department}
														</span>
													</span>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 shrink-0">
										<div className="text-right">
											<div className="flex items-center gap-1 text-xs font-mono font-medium text-blue-400">
												<Phone className="w-3 h-3" />
												<span>{localPhone}</span>
											</div>
											<span className="text-[10px] text-slate-500 block">
												без +992
											</span>
										</div>

										<div className="w-8 h-8 rounded-lg bg-blue-500/10 group-hover:bg-blue-600 group-hover:text-white text-blue-400 flex items-center justify-center transition-all border border-blue-500/20 group-hover:border-blue-500">
											<Check className="w-4 h-4" />
										</div>
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>
		</Modal>
	);
};
