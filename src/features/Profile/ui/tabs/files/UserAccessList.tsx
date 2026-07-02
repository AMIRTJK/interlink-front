import React, { useState } from "react";
import { Search, Users } from "lucide-react";
import { If } from "@shared/ui";
import { MOCK_USERS } from "../mockData";

interface IProps {
  selectedUsers: string[];
  onToggleUser: (userId: string) => void;
}

export const UserAccessList = ({ selectedUsers, onToggleUser }: IProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = MOCK_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
          <Users size={12} />
          <span>ПРАВА ДОСТУПА (ПРОСМОТР)</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          Выберите пользователей, которые могут видеть содержимое папки
        </p>
      </div>

      {/* User Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Поиск пользователя..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* User List */}
      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2">
        {filteredUsers.map((user) => {
          const isChecked = selectedUsers.includes(user.id);
          return (
            <div
              key={user.id}
              onClick={() => onToggleUser(user.id)}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white! ${user.avatarColor}`}>
                  {user.initials}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {user.role}
                  </div>
                </div>
              </div>
              
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
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
      </div>
    </div>
  );
};
