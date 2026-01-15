import React from "react";
import { Avatar } from "antd";
import { SafetyCertificateOutlined, SafetyCertificateFilled, CrownFilled } from "@ant-design/icons";
import userAvatar from '../../../assets/images/user-avatar.jpg'
import { IResolution } from "../model";
import { ResolutionFileList } from "./ResolutionFileList";

// Свойства боковой панели информации
interface IProps {
    resolution: IResolution; // Объект резолюции
}

// Боковая панель с деталями резолюции (ЭЦП, Основание, Исполнители)
export const ResolutionInfoSidebar: React.FC<IProps> = ({ resolution }) => {
    return (
        <div className="resolution-execution__sidebar">
            <div className="resolution-execution__details-card">
                
                {/* Шапка: Статус электронной подписи */}
                <div className="resolution__card-signed-banner">
                    <SafetyCertificateOutlined className="text-xl" />
                    <span>Подписано электронной подписью</span>
                </div>

                {/* Техническая информация об ЭЦП */}
                <div className="resolution-execution__signature-info">
                    <span className="resolution__card-label">Электронная подпись</span>
                    <span className="resolution-execution__signer-name">{resolution.author.full_name}</span>
                    
                    {/* Сведения о времени и валидности */}
                    <div className="resolution-execution__signature-row">
                        <span>Дата и время:</span>
                        <span className="text-blue-700 font-bold">23.07.2025 • 14:32</span>
                    </div>
                    
                    <div className="resolution-execution__signature-row">
                        <span>Сертификат:</span>
                        <span className="text-green-600 font-bold">Действителен</span>
                    </div>

                    {/* Ссылка на детали сертификата */}
                    <a href="#" className="resolution-execution__link">Подробнее о подписи</a>
                </div>

                {/* Текст основания резолюции */}
                <div className="resolution-execution__section">
                    <span className="resolution__card-label">Основание</span>
                    <p className="resolution-execution__text">{resolution.description}</p>
                </div>

                {/* Список исполнителей в виде интерактивных «пилюль» */}
                <div className="resolution-execution__section">
                    <span className="resolution__card-label">Исполнители</span>
                    <div className="resolution-execution__executors-list">
                        {resolution.executors.map(ex => {
                            const isMain = ex.isMain;
                            return (
                                <div 
                                    key={ex.id} 
                                    className={`resolution-execution__executor-item ${isMain ? 'resolution-execution__executor-item--main' : ''}`}
                                >
                                    <Avatar src={userAvatar} size={24} />
                                    <span>{ex.user.full_name}</span>
                                    {isMain && <CrownFilled className="text-black opacity-80" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Блок прикрепленных файлов (только для чтения) */}
            <div className="resolution-execution__files mt-4">
                <ResolutionFileList 
                    files={resolution.files} 
                    onRemove={() => {}} 
                    isAllowed={false} 
                />
            </div>
        </div>
    );
};
