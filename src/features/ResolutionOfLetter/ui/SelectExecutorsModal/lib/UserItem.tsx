import { Tooltip } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { IUser } from '../model';

interface UserItemProps {
    user: IUser;
    isSelected: boolean;
    onToggle: (user: IUser) => void;
}

// Компонент карточки сотрудника (отображение в сетке)
export const UserItem: React.FC<UserItemProps> = ({ user, isSelected, onToggle }) => {
    return (
        <Tooltip title={user.position || "Сотрудник"}>
            <div 
                className={`user__card ${isSelected ? 'user__card--selected' : ''}`}
                onClick={() => onToggle(user)}
            >
                <div className="user__avatar-wrapper">
                    <div className="user__avatar flex items-center justify-center bg-gray-200 rounded-full h-10 w-10 text-gray-500 font-bold overflow-hidden">
                        {user.photo_path ? (
                            <img src={user.photo_path} alt={user.full_name} className="h-full w-full object-cover" />
                        ) : (
                            (user.full_name && user.full_name.charAt(0).toUpperCase()) || "U"
                        )}
                    </div>
                    {isSelected && (
                        <div className="user__check absolute top-0 right-0 p-1">
                            <CheckCircleFilled className="text-green-500 text-lg bg-white rounded-full" />
                        </div>
                    )}
                </div>
                {/* Информация */}
            <h4 className="user__name text-center" title={user.full_name}>{user.full_name}</h4>
            <span className="user__position text-center">
                {user.roles?.[0]?.name || user.position || "Сотрудник"}
            </span>
            <span className="user__department text-center text-xs text-gray-400 mt-1">
                {user.departments?.[0]?.name || user.department?.name || user.organization?.name || ""}
            </span>
            </div>
        </Tooltip>
    );
};
