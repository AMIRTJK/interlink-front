import { Button, Form, UploadFile } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { SelectExecutorsModal, IDepartment, IUser } from "../ui/SelectExecutorsModal";
import { useState } from "react";
import usersIcon from '../../../assets/icons/users.svg'
import '../ResolutionOfLetter.css'
import { If } from "@shared/ui";
import { useMutationQuery } from "@shared/lib/hooks/useMutationQuery";
import { ApiRoutes } from "@shared/api";
import { ResolutionAuthor } from "../ui/ResolutionAuthor";
import { ResolutionFileList } from "../ui/ResolutionFileList";
import { ResolutionForm } from "../ui/ResolutionForm";
import { ResolutionPreviewCard } from "../ui/ResolutionPreviewCard";

interface IProps {
    resolutionerName: string;
    mutate: (values: {[key:string]:string|number}) => void;
    isPending: boolean;
    isAllowed: boolean;
}

export const RenderField: React.FC<IProps> = ({ resolutionerName, mutate: originalMutate, isPending: originalIsPending }) => {
    const [form] = Form.useForm();
    const [executorModalOpen, setExecutorModalOpen] = useState(false);
    const [selectedDepts, setSelectedDepts] = useState<IDepartment[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

    const visaValue = Form.useWatch('visa', form);

    const { mutate: submitResolution, isPending: isSubmitting } = useMutationQuery({
        url: ApiRoutes.CREATE_RESOLUTION.replace(':id', '1'),
        method: 'POST',
        messages: {
            success: 'Резолюция успешно создана',
            error: 'Ошибка при создании резолюции'
        },
        queryOptions: {
            onSuccess: (data) => {
                originalMutate(data);
            }
        }
    });

    const { mutate: uploadFile, isPending: isUploading } = useMutationQuery({
        url: '/api/v1/files/upload',
        method: 'POST',
        messages: {
            success: 'Файл успешно загружен',
            error: 'Ошибка при загрузке файла'
        }
    });

    const handleExecutorsSelected = (departments: IDepartment[], users: IUser[]) => {
        setSelectedDepts(departments);
        setSelectedUsers(users);
        form.setFieldsValue({
            assignee_departments: departments?.map(d => d.id),
            assignee_users: users?.map(u => u.id)
        });
    };

    const handleRemoveDept = (id: number) => {
        const newDepts = selectedDepts?.filter(d => d.id !== id);
        setSelectedDepts(newDepts);
        form.setFieldValue('assignee_departments', newDepts?.map(d => d.id));
    };

    const handleRemoveUser = (id: number) => {
        const newUsers = selectedUsers?.filter(u => u.id !== id);
        setSelectedUsers(newUsers);
        form.setFieldValue('assignee_users', newUsers.map(u => u.id));
    };

    const handleRemoveFile = (uid: string) => {
        const newFiles = uploadedFiles.filter(f => f.uid !== uid);
        setUploadedFiles(newFiles);
    };

    const handleUploadChange = (info: any) => {
        setUploadedFiles(info.fileList);
        if (info.file.status === 'done' || (info.file.originFileObj && !info.file.status)) {
            const formData = new FormData();
            formData.append('file', info.file.originFileObj || info.file);
            uploadFile(formData as any);
        }
    };

    const onFinish = (values: any) => {
        submitResolution(values);
    };

    const hasSelection = selectedDepts.length > 0 || selectedUsers.length > 0;

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
                            isPending={isSubmitting || originalIsPending}
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
                            onSubmit={() => form.submit()}
                            isPending={isSubmitting || originalIsPending}
                        />
                    </If>

                    <ResolutionFileList 
                        files={uploadedFiles}
                        onRemove={handleRemoveFile}
                    />
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