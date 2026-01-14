import React from "react";
import { Button, FormInstance } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { SelectExecutorsModal, IDepartment, IUser } from "@features/SelectExecutors";
import { If } from "@shared/ui";
import { ResolutionAuthor } from "../ui/ResolutionAuthor";
import { ResolutionForm } from "../ui/ResolutionForm";
import { ResolutionExecutionLayout } from "../ui/ResolutionExecutionLayout";
import { IResolution } from "../model";
import usersIcon from '../../../assets/icons/users.svg'

interface IRenderFieldProps {
    resolutionerName: string;
    previewResolution: IResolution;
    form: FormInstance;
    executorModalOpen: boolean;
    setExecutorModalOpen: (open: boolean) => void;
    selectedDepts: IDepartment[];
    selectedUsers: IUser[];
    uploadedFiles: any[];
    isTotalPending: boolean;
    isAllowed: boolean;
    hasSelection: boolean;
    handleExecutorsSelected: (departments: IDepartment[], users: IUser[]) => void;
    handleRemoveFile: (id: number) => void;
    handleUploadChange: (info: any) => void;
    onFinish: (values: any) => void;
}

export const RenderField: React.FC<IRenderFieldProps> = ({
    resolutionerName,
    previewResolution,
    form,
    executorModalOpen,
    setExecutorModalOpen,
    selectedDepts,
    selectedUsers,
    uploadedFiles,
    isTotalPending,
    isAllowed,
    hasSelection,
    handleExecutorsSelected,
    handleRemoveFile,
    handleUploadChange,
    onFinish
}) => {
    return (
        <>
            <SelectExecutorsModal 
                open={executorModalOpen} 
                onCancel={() => setExecutorModalOpen(false)}
                onOk={handleExecutorsSelected}
                initialSelectedDepartments={selectedDepts}
                initialSelectedUsers={selectedUsers}
            />
            
            <If is={!hasSelection}>
                <div className="resolution__content">
                    <div className="resolution__left-content">
                        <ResolutionAuthor name={resolutionerName} />
                        <ResolutionForm 
                            form={form}
                            onFinish={onFinish}
                            onSelectExecutors={() => setExecutorModalOpen(true)}
                            onUploadChange={handleUploadChange}
                            files={uploadedFiles}
                            onRemoveFile={handleRemoveFile}
                            isPending={isTotalPending}
                            isAllowed={isAllowed}
                        />
                    </div>
                    <div className="resolution__right-content">
                        <div className="resolution__right-content-action">
                            <img className="resolution__right-content-action-icon" src={usersIcon} alt="users"/>
                            <h3 className="resolution__right-title">Исполнители не назначены</h3>
                            <p className="resolution__right-text">Выберите исполнителей слева</p>
                            <Button icon={<PlusOutlined />} type="link" className="resolution__button-executor-right" onClick={() => setExecutorModalOpen(true)}>
                                Выбрать исполнителя
                            </Button>
                        </div>
                    </div>
                </div>
            </If>

            <If is={hasSelection}>
                <ResolutionExecutionLayout 
                    resolution={previewResolution}
                    actionButton={
                        <Button 
                            type="primary" 
                            className="resolution-execution__main-btn" 
                            onClick={() => {
                                form.validateFields().then(onFinish);
                            }}
                            loading={isTotalPending}
                        >
                            Визировать
                        </Button>
                    }
                />
            </If>
        </>
    );
};
