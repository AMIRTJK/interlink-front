import React from "react";
import { Avatar } from "antd";
import { 
    SyncOutlined, 
    FileTextOutlined, 
    MessageOutlined,
    ClockCircleOutlined 
} from "@ant-design/icons";
import { IExecutor } from "../model";
import userAvatar from '../../../assets/images/user-avatar.jpg'

/**
 * Card representing a single executor.
 * Shows avatar, name, current status, and available actions.
 */

// Props: executor object
interface IProps {
    executor: IExecutor;
}

export const ExecutorCard: React.FC<IProps> = ({ executor }) => {
    
    // Helper to determine status badge color
    const getStatusBadgeClass = (status: string) => {
        if (status === 'DONE') return 'resolution-execution__status-badge--green';
        if (status === 'PREPARING') return 'resolution-execution__status-badge--orange';
        return 'resolution-execution__status-badge--gray';
    };

    return (
        <div className="resolution-execution__executor-card">
            {/* User Info Block */}
            <div className="flex gap-4 mb-4">
                <Avatar src={userAvatar} size={48} />
                <div>
                    <h4 className="font-bold text-gray-800 text-lg">{executor.user.full_name}</h4>
                    <p className="text-gray-500 text-sm">{executor.role}</p>
                </div>
            </div>

            {/* Status Badge */}
            <div className={`resolution-execution__status-badge ${getStatusBadgeClass(executor.status)} mb-4 w-full text-center`}>
                {executor.statusText}
            </div>

            {/* Actions List (Icons) */}
            <div className="resolution-execution__actions-list">
                {/* Current Stage */}
                <div className="resolution-execution__action-item text-blue-600">
                    <SyncOutlined /> 
                    <span>Исполнение</span>
                </div>
                
                <div className="resolution-execution__action-item">
                    <ClockCircleOutlined /> 
                    <span>Виза</span>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4 mt-2">
                    <div className="resolution-execution__action-link">
                        <FileTextOutlined />
                        <span>Создать заключение</span>
                    </div>
                    <div className="resolution-execution__action-link">
                        <MessageOutlined />
                        <span>Сообщение</span>
                    </div>
                </div>

                {/* Last Action Log */}
                <div className="resolution-execution__action-item mt-2">
                    <ClockCircleOutlined />
                    <span>Действие</span>
                </div>
            </div>
        </div>
    );
};
