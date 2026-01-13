import { Button, FormInstance } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { SelectExecutorsModal, IDepartment, IUser } from "@features/SelectExecutors";
import usersIcon from '@shared/assets/icons/users.svg'
import { If } from "@shared/ui";
import { ResolutionAuthor } from "../ui/ResolutionAuthor";
import { ResolutionForm } from "../ui/ResolutionForm";
import { ResolutionPreviewCard } from "../ui/ResolutionPreviewCard";

interface IRenderFieldProps {
    resolutionerName: string;
    form: FormInstance;
    executorModalOpen: boolean;
    setExecutorModalOpen: (open: boolean) => void;
    selectedDepts: IDepartment[];
    selectedUsers: IUser[];
    uploadedFiles: any[];
    visaValue: any;
    isTotalPending: boolean;
    isAllowed: boolean;
    hasSelection: boolean;
    handleExecutorsSelected: (departments: IDepartment[], users: IUser[]) => void;
    handleRemoveDept: (id: number) => void;
    handleRemoveUser: (id: number) => void;
    handleRemoveFile: (id: number) => void;
    handleUploadChange: (info: any) => void;
    onFinish: (values: any) => void;
}

export const RenderField: React.FC<IRenderFieldProps> = ({
    resolutionerName,
    form,
    executorModalOpen,
    setExecutorModalOpen,
    selectedDepts,
    selectedUsers,
    uploadedFiles,
    visaValue,
    isTotalPending,
    isAllowed,
    hasSelection,
    handleExecutorsSelected,
    handleRemoveDept,
    handleRemoveUser,
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
            <div className="resolution__content">
                <div className="resolution__left-content">
                    <ResolutionAuthor name={resolutionerName} />

                    <If is={!hasSelection}>
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
                    </If>

                    <If is={hasSelection}>
                        <ResolutionPreviewCard 
                            resolutionerName={resolutionerName}
                            selectedDepts={selectedDepts}
                            selectedUsers={selectedUsers}
                            visaValue={visaValue}
                            onRemoveDept={handleRemoveDept}
                            onRemoveUser={handleRemoveUser}
                            onUploadChange={handleUploadChange}
                            files={uploadedFiles}
                            onRemoveFile={handleRemoveFile}
                            onSubmit={() => form.submit()}
                            isPending={isTotalPending}
                            isAllowed={isAllowed}
                        />
                    </If>
                </div>

                <If is={!hasSelection}>
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
                </If>
            </div>
        </>
    );
};
