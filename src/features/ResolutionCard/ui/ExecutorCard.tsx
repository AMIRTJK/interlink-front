import React from 'react';
import { Avatar } from 'antd';
import { CheckSquareFilled, UserOutlined } from '@ant-design/icons';
import { IExecutor } from '../model';

export const ExecutorCard: React.FC<IExecutor> = ({ 
    name = "ИМЯ ОТСУТСТВУЕТ", 
    position = "ДОЛЖНОСТЬ НЕ УКАЗАНА", 
    avatarUrl, 
    isMain = false 
}) => {
    return (
        <div className="letter-execution__executor-card">
            <div className="letter-execution__executor-avatar">
                <Avatar 
                    size={56} 
                    icon={<UserOutlined />} 
                    src={avatarUrl} 
                />
            </div>
            <div className="letter-execution__executor-info">
                <div className="letter-execution__executor-header">
                    <span className="letter-execution__executor-label">
                        {isMain ? "Главный исполнитель" : "Исполнитель"}
                    </span>
                    {isMain && <CheckSquareFilled className="letter-execution__executor-check" />}
                </div>
                <div className="letter-execution__executor-name">{name}</div>
                <div className="letter-execution__executor-pos">{position}</div>
            </div>
        </div>
    );
};
