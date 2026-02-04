import React from "react";
import { Avatar, Button, Tooltip } from "antd";
import { FileTextOutlined, CheckOutlined } from "@ant-design/icons";
import userAvatar from '../../../assets/images/user-avatar.jpg'
import { IConclusion } from "../model";

/**
 * Карточка с готовым заключением.
 * Тут показываем того, кто написал, дату и список согласовавших.
 * Есть кнопки "Посмотреть документ" (саму PDFку) и "Подтвердить" (некий акцепт).
 */

// Приходит только объект заключения
interface IProps {
    conclusion: IConclusion;
}

export const ConclusionCard: React.FC<IProps> = ({ conclusion }) => {
    return (
        <div className="resolution-execution__conclusion-card">
            {/* Верхний колонтитул с датой создания */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-gray-400 text-xs">Заключение от {conclusion.date}</span>
            </div>

            {/* Кто написал (аватар + имя + должность) */}
            <div className="flex gap-3 mb-4">
                <Avatar src={userAvatar} size={40} />
                <div>
                    <h4 className="font-bold text-gray-800">{conclusion.author.full_name}</h4>
                    <p className="text-gray-500 text-xs">{conclusion.author.position}</p>
                </div>
            </div>

            {/* Согласующие (если есть) - показываем их аватарки в ряд */}
            <div className="mb-4">
                <span className="text-gray-400 text-xs block mb-2">Согласующие</span>
                <div className="flex -space-x-2">
                    <Tooltip title="Иванов Иван">
                        <Avatar src={userAvatar} size={28} className="border-2 border-white" />
                    </Tooltip>
                    <Tooltip title="Смирнов Петр">
                        <Avatar src={userAvatar} size={28} className="border-2 border-white" />
                    </Tooltip>
                </div>
            </div>

            {/* Ссылка на просмотр самого текста/файла */}
            <div className="resolution-execution__action-link">
                <FileTextOutlined />
                <span>Посмотреть заключение</span>
            </div>

            {/* Кнопка действия (например, принять работу) */}
            <Button className="resolution-execution__confirm-btn">
                <CheckOutlined /> Подтвердить
            </Button>
        </div>
    );
};
