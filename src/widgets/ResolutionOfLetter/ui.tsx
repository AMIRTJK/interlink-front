import React from "react";
import { Modal } from "antd";
import { useResolutionOfLetter } from "./lib/useResolutionOfLetter";
import { RenderField } from "./lib/renderField";
import { tokenControl } from "@shared/lib";
import { ResolutionExecution } from "./ui/ResolutionExecution";
import { mapStateToResolution } from "./lib/mappers";
import './ui/ResolutionOfLetter.css';

/**
 * Корневой компонент виджета "Резолюция".
 * Отвечает за:
 * 1. Форму создания новой резолюции (выбор людей, файлов).
 * 2. Режим предпросмотра (Execution View) перед отправкой.
 * 3. Связь с API и управление состоянием через хук useResolutionOfLetter.
 */

interface IProps {
    isLetterExecutionVisible: boolean;
    setIsLetterExecutionVisible: (visible: boolean) => void;
}

export const ResolutionOfLetter: React.FC<IProps> = ({ setIsLetterExecutionVisible }) => {
    // Вытаскиваем инфу о текущем юзере из локального хранилища.
    // Если его нет (ну вдруг), показываем дефолтное имя, чтоб не крэшилось.
    const currentUser = tokenControl.getUserData();
    const currentUserName = currentUser?.full_name || 'Сотрудник';

    const {
        form,
        executorModalOpen,
        setExecutorModalOpen,
        executionModalOpen,
        setExecutionModalOpen,
        selectedDepts,
        selectedUsers,
        uploadedFiles,
        visaValue,
        isTotalPending,
        isAllowed,
        hasSelection,
        handleExecutorsSelected,
        handleRemoveFile,
        handleUploadChange,
        onFinish
    } = useResolutionOfLetter();

    // Собираем объект резолюции на лету, используя данные из формы.
    // Это нужно, чтобы в превьюхе сразу показать то, что юзер понавыбирал.
    const previewResolution = mapStateToResolution(
        currentUser,
        selectedUsers,
        visaValue,
        uploadedFiles
    );

    return (
        <div className="resolution-of-letter__container">
            {/* Форма создания резолюции */}
            <Modal
                title={<div className="flex items-center gap-4"><span>Резолюция</span> <span className="text-gray-400 font-normal text-sm">Область визирующего</span></div>}
                open={!executionModalOpen} // Скрываем, когда открыт режим просмотра
                width={1200}
                onCancel={() => setIsLetterExecutionVisible(false)}
                footer={null}
                className="resolution-execution-modal"
            >
                <RenderField 
                    resolutionerName={currentUserName}
                    previewResolution={previewResolution}
                    form={form}
                    executorModalOpen={executorModalOpen}
                    setExecutorModalOpen={setExecutorModalOpen}
                    selectedDepts={selectedDepts}
                    selectedUsers={selectedUsers}
                    uploadedFiles={uploadedFiles}
                    isTotalPending={isTotalPending ?? false}
                    isAllowed={isAllowed ?? false}
                    hasSelection={hasSelection}
                    handleExecutorsSelected={handleExecutorsSelected}
                    handleRemoveFile={handleRemoveFile}
                    handleUploadChange={handleUploadChange}
                    onFinish={onFinish}
                />
            </Modal>

            {/* Режим просмотра (исполнения) резолюции */}
            <ResolutionExecution 
                open={executionModalOpen} 
                resolution={previewResolution}
                onCancel={() => {
                    setExecutionModalOpen(false);
                    setIsLetterExecutionVisible(false); // Закрыть всё при закрытии
                }}
            />
        </div>
    );
};
