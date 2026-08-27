import { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { If } from "@shared/ui";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IAdminUser } from "@entities/hr/model";
import { UserAvatar } from "./UserAvatar";

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

const getFullName = (user: IAdminUser): string =>
  [user.last_name, user.first_name].filter(Boolean).join(" ") || user.full_name || "—";

export const UserAccessList = ({ selectedUsers, onToggleUser, excludeUserIds }: IProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const userQueryParams = useMemo(() => ({ per_page: 100 }), []);

  const { data, isLoading } = useGetQuery<{ per_page: number }, IApiUsersResponse>({
    url: ApiRoutes.GET_USERS,
    params: userQueryParams,
    useToken: true,
    options: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
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
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl animate-pulse"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div
                      className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md"
                      style={{ width: `${45 + (idx % 4) * 15}%` }}
                    />
                    <div
                      className="h-2.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-md"
                      style={{ width: `${25 + (idx % 3) * 18}%` }}
                    />
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-slate-200/70 dark:bg-slate-800/70 shrink-0 ml-3" />
              </div>
            ))}
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
                    <UserAvatar user={user} size={40} />
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
