import { useState } from "react";
import { Search, Users } from "lucide-react";
import { If } from "@shared/ui";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IAdminUser } from "@entities/hr/model";

interface IApiUsersResponse {
  success: boolean;
  data: {
    data: IAdminUser[];
    current_page: number;
    total: number;
  };
}

interface IProps {
  selectedUsers: number[];
  onToggleUser: (userId: number) => void;
  excludeUserIds?: number[];
}

const getInitials = (user: IAdminUser): string => {
  const first = user.first_name?.[0] ?? "";
  const last = user.last_name?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
};

const getFullName = (user: IAdminUser): string =>
  [user.last_name, user.first_name].filter(Boolean).join(" ") || user.full_name || "—";

const AVATAR_COLORS = [
  "bg-indigo-500!",
  "bg-emerald-500!",
  "bg-rose-500!",
  "bg-amber-500!",
  "bg-sky-500!",
  "bg-purple-500!",
  "bg-teal-500!",
  "bg-pink-500!",
];

const getAvatarColor = (id: number): string => AVATAR_COLORS[id % AVATAR_COLORS.length];

export const UserAccessList = ({ selectedUsers, onToggleUser, excludeUserIds }: IProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useGetQuery<{ per_page: number }, IApiUsersResponse>({
    url: ApiRoutes.GET_USERS,
    params: { per_page: 100 },
    useToken: true,
  });

  const users: IAdminUser[] = Array.isArray(data?.data?.data) ? data!.data.data : [];

  const filteredUsers = users.filter((user) => {
    if (excludeUserIds?.includes(user.id)) return false;
    const name = getFullName(user).toLowerCase();
    const pos = (user.position ?? "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || pos.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
          <Users size={12} />
          <span>ПРАВА ДОСТУПА (ПРОСМОТР)</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Выберите пользователей, которые могут видеть содержимое папки
        </p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Поиск пользователя..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-1 max-h-[460px]! overflow-y-auto pr-1">
        <If is={isLoading}>
          <div className="flex items-center justify-center py-8 text-xs text-slate-400">
            Загрузка...
          </div>
        </If>

        <If is={!isLoading && filteredUsers.length === 0}>
          <div className="flex items-center justify-center py-8 text-xs text-slate-400">
            Пользователи не найдены
          </div>
        </If>

        <If is={!isLoading && filteredUsers.length > 0}>
          <>
            {filteredUsers.map((user) => {
              const isChecked = selectedUsers.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => onToggleUser(user.id)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white! ${getAvatarColor(user.id)}`}
                    >
                      {getInitials(user)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-700 dark:text-zinc-300 truncate">
                        {getFullName(user)}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-zinc-500 truncate">
                        {user.position ?? user.department?.name ?? ""}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ml-3 ${
                      isChecked
                        ? "bg-indigo-600! border-indigo-600!"
                        : "border-slate-300 dark:border-slate-700 bg-transparent"
                    }`}
                  >
                    <If is={isChecked}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white!" />
                    </If>
                  </div>
                </div>
              );
            })}
          </>
        </If>
      </div>
    </div>
  );
};
