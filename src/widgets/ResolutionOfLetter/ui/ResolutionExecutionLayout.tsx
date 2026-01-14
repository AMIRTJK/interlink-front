import React from "react";
import { ResolutionInfoSidebar } from "./ResolutionInfoSidebar";
import { ExecutionHeader } from "./ExecutionHeader";
import { ExecutorCard } from "./ExecutorCard";
import { ConclusionCard } from "./ConclusionCard";
import { IResolution } from "../model";
import "./ResolutionOfLetter.css";

interface IProps {
    resolution: IResolution;
    actionButton?: React.ReactNode;
}

export const ResolutionExecutionLayout: React.FC<IProps> = ({ resolution, actionButton }) => {
    return (
        <div className="resolution-execution__layout">
            {/* Левая панель (Инфо) */}
            <ResolutionInfoSidebar resolution={resolution} />

            {/* Правая панель (Контент) */}
            <div className="resolution-execution__content">
                {/* Шапка */}
                <ExecutionHeader resolution={resolution} actionButton={actionButton} />

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

                {/* Секция заключений - показываем только если они есть */}
                {resolution.conclusions.length > 0 && (
                    <div>
                        <h3 className="resolution-execution__section-title">Заключения</h3>
                        <div className="resolution-execution__grid">
                            {resolution.conclusions.map(conclusion => (
                                <ConclusionCard key={conclusion.id} conclusion={conclusion} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
