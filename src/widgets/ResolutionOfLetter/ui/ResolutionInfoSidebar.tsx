import React from "react";
import { Avatar } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import userAvatar from '../../../assets/images/user-avatar.jpg'
import { IResolution } from "../model";
import { ResolutionFileList } from "./ResolutionFileList";

/**
 * Боковая панель с детальной информацией (слева).
 * Содержит данные об авторе (кто выдал резолюцию), 
 * текст основания, список прикрепленных исполнителей и файлов.
 * Также отображает статус электронной подписи.
 */

interface IProps {
    resolution: IResolution;
}

export const ResolutionInfoSidebar: React.FC<IProps> = ({ resolution }) => {
    return (
        <div className="resolution-execution__sidebar">
            {/* Карточка автора резолюции (тот, кто всё затеял) */}
            <div className="resolution-execution__author-card">
                <div className="resolution-execution__author-header">
                    <Avatar src={userAvatar} size={48} />
                    <div className="resolution-execution__author-info">
                        <span className="resolution-execution__author-name">{resolution.author.full_name}</span>
                        <span className="resolution-execution__author-role">{resolution.author.position}</span>
                    </div>
                </div>
            </div>

            {/* Основной блок с деталями: текст, исполнители, подпись */}
            <div className="resolution-execution__details-card">
                {/* Баннер "Подписано ЭЦП" - для важности */}
                <div className="resolution__card-signed-banner">
                    <SafetyCertificateOutlined />
                    <span>Подписано электронной подписью</span>
                </div>

                {/* Основание / Суть задачи */}
                <div className="resolution-execution__section">
                    <span className="resolution__card-label">Основание</span>
                    <p className="resolution-execution__text">{resolution.description}</p>
                </div>

                {/* Текстовый список исполнителей (дублирует визуальный список справа, но компактнее) */}
                <div className="resolution-execution__section">
                    <span className="resolution__card-label">Исполнители</span>
                    <div className="resolution-execution__executors-list">
                        <div className="resolution-execution__executor-item">
                            <Avatar src={userAvatar} size={20} />
                            <span>{resolution.mainExecutor.full_name}</span>
                        </div>
                        {resolution.executors.map(ex => (
                            <div key={ex.id} className="resolution-execution__executor-item">
                                <Avatar src={userAvatar} size={20} />
                                <span>{ex.user.full_name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Техническая инфа о подписи (дата, статус сертификата) */}
                <div className="resolution-execution__signature-info">
                    <span className="resolution__card-label">Электронная подпись</span>
                    <span className="resolution-execution__signer-name">{resolution.author.full_name}</span>
                    
                    <div className="resolution-execution__signature-row">
                        <span>Дата и время:</span>
                        <span className="text-blue-600 font-medium">23.07.2025, 14:32</span>
                    </div>
                    
                    <div className="resolution-execution__signature-row">
                        <span>Сертификат:</span>
                        <span className="text-green-500 font-medium">Действителен</span>
                    </div>

                    <a href="#" className="resolution-execution__link">Подробнее о подписи</a>
                </div>
            </div>

            {/* Список прикрепленных файлов (доки, сканы и т.д.) */}
            <div className="resolution-execution__files">
                {/* Используем уже готовый компонент списка файлов в режиме только чтение */}
                <ResolutionFileList 
                    files={resolution.files} 
                    onRemove={() => {}} 
                    isAllowed={false} 
                />
            </div>
        </div>
    );
};
