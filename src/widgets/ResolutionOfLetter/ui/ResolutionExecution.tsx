import React from "react";
import { Modal } from "antd";
import { ResolutionInfoSidebar } from "./ResolutionInfoSidebar";
import { ExecutionHeader } from "./ExecutionHeader";
import { ExecutorCard } from "./ExecutorCard";
import { ConclusionCard } from "./ConclusionCard";
import { IResolution } from "../model";
import "./ResolutionOfLetter.css";

/**
 * Основной конейнер для режима "Исполнение резолюции".
 * Собирает внутри себя все мелкие виджеты: сайдбар, шапку и списки карточек.
 * По сути, просто раскладывает всё по сетке.
 */

// Пропсы: открыто ли окно и сами данные резолюции
interface IProps {
    open: boolean;
    onCancel: () => void;
    resolution: IResolution;
}

// Главный компонент режима просмотра резолюции
export const ResolutionExecution: React.FC<IProps> = ({ open, onCancel, resolution }) => {
    return (
        // Используем стандартную модалку Ant Design как обертку
        <Modal
            open={open}
            onCancel={onCancel}
            width={1400}
            footer={null}
            className="resolution-execution-modal"
            centered
        >
            <div className="resolution-execution__layout">
                {/* Левая панель (Инфо) */}
                <ResolutionInfoSidebar resolution={resolution} />

                {/* Правая панель (Контент) */}
                <div className="resolution-execution__content">
                    {/* Шапка */}
                    <ExecutionHeader resolution={resolution} />

                    {/* Секция исполнителей */}
                    <div className="mb-8">
                        <h3 className="resolution-execution__section-title">Исполнители</h3>
                        <div className="resolution-execution__grid">
                            {resolution.executors.length > 0 ? (
                                resolution.executors.map(executor => (
                                    <ExecutorCard key={executor.id} executor={executor} />
                                ))
                            ) : (
                                <p className="text-gray-400">Исполнители не назначены</p>
                            )}
                        </div>
                    </div>

                    {/* Секция заключений */}
                    <div>
                        <h3 className="resolution-execution__section-title">Заключения</h3>
                        <div className="resolution-execution__grid">
                            {resolution.conclusions.length > 0 ? (
                                resolution.conclusions.map(conclusion => (
                                    <ConclusionCard key={conclusion.id} conclusion={conclusion} />
                                ))
                            ) : (
                                <p className="text-gray-400">Заключений пока нет</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
