import React from 'react';
import { Empty, Spin } from "antd";
import { IUser } from "../model";
import { UserItem } from "./UserItem";

interface UsersListProps {
    loading: boolean;
    users: IUser[];
    selectedUsers: IUser[];
    onToggle: (user: IUser) => void;
    pagination?: { current_page: number; last_page: number };
    onPageChange?: (page: number) => void;
}

export const UsersList: React.FC<UsersListProps> = ({ loading, users, selectedUsers, onToggle, pagination, onPageChange }) => {
    if (loading) return <div className="text-center py-10"><Spin /></div>;
    
    if (users.length === 0) {
        return <Empty description={<span style={{color: '#666'}}>Сотрудники не найдены</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
        <div className="users__list-container">
            <div className="users__list mb-4">
                {users.map((user) => (
                    <UserItem 
                        key={user.id} 
                        user={user}
                        isSelected={!!selectedUsers.find(u => u.id === user.id)}
                        onToggle={onToggle}
                    />
                ))}
            </div>
            
            {pagination && (
                <div className="flex justify-center items-center gap-4 py-2">
                    <button 
                        className={`px-3 py-1 rounded border ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        onClick={() => onPageChange?.(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                    >
                        Назад
                    </button>
                    <span className="text-sm">
                        Страница {pagination.current_page} из {pagination.last_page}
                    </span>
                    <button 
                        className={`px-3 py-1 rounded border ${pagination.current_page === pagination.last_page ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        onClick={() => onPageChange?.(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                    >
                        Вперед
                    </button>
                </div>
            )}
        </div>
    );
};
