import React from "react";
import { Avatar, Button, Tooltip } from "antd";
import userAvatar from '../../../assets/images/user-avatar.jpg'

import { IResolution } from "../model";

/**
 * Шапка модального окна просмотра резолюции.
 * Находится справа сверху.
 * Показывает ключевых людей (кто главный, кто согласует) и текущий статус задачи.
 * Там же кнопка действия (например, "Подготовить ответ").
 */

interface IProps {
    resolution: IResolution;
    actionButton?: React.ReactNode;
}

export const ExecutionHeader: React.FC<IProps> = ({ resolution, actionButton }) => {
    return (
        <div className="resolution-execution__header">
            <div className="resolution-execution__header-info">
                {/* Блок главного исполнителя - самый важный человек в задаче */}
                <div className="resolution-execution__header-block">
                    <span className="resolution-execution__header-label">Гл. исполнитель</span>
                    <div className="flex items-center gap-2">
                        <Tooltip title={resolution.mainExecutor.full_name}>
                            <Avatar src={userAvatar} />
                        </Tooltip>
                    </div>
                </div>

                {/* Блок согласующих - те, кто должен одобрить */}
                <div className="resolution-execution__header-block">
                    <span className="resolution-execution__header-label">Согласующие</span>
                    <div className="flex -space-x-2">
                        {resolution.approvers.map(approver => (
                            <Tooltip key={approver.id} title={approver.full_name}>
                                <Avatar src={userAvatar} className="border-2 border-white" />
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* Текущий статус резолюции (цветной бейджик) */}
                <div className="resolution-execution__header-block">
                    <span className="resolution-execution__header-label">Статус</span>
                    <div className="resolution-execution__status-badge resolution-execution__status-badge--orange">
                        {resolution.status}
                    </div>
                </div>
            </div>

            {/* Главная кнопка действия (самое видное место) */}
            {actionButton ? (
                actionButton
            ) : (
                <Button type="primary" size="large" className="resolution-execution__main-btn">
                    Подготовить ответ
                </Button>
            )}
        </div>
    );
};
