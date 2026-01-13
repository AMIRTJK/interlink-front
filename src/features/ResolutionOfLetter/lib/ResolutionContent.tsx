import { useState, useRef } from "react";
import { Button, Form } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { SelectExecutorsModal, IDepartment, IUser } from "../ui/SelectExecutorsModal";
import usersIcon from '../../../assets/icons/users.svg'
import '../ResolutionOfLetter.css'
import { If } from "@shared/ui";
import { useMutationQuery } from "@shared/lib/hooks/useMutationQuery";
import { useGetQuery } from "@shared/lib/hooks/useGetQuery";
import { ApiRoutes } from "@shared/api";
import { ResolutionAuthor } from "../ui/ResolutionAuthor";
import { ResolutionForm } from "../ui/ResolutionForm";
import { ResolutionPreviewCard } from "../ui/ResolutionPreviewCard";

interface IProps {
    resolutionerName: string;
    mutate: (values: { [key: string]: string | number }) => void;
    isPending: boolean;
    isAllowed: boolean;
}

export const ResolutionContent: React.FC<IProps> = ({ resolutionerName, mutate: originalMutate, isPending: originalIsPending, isAllowed }) => {
    const [form] = Form.useForm();
    const [executorModalOpen, setExecutorModalOpen] = useState(false);
    const [selectedDepts, setSelectedDepts] = useState<IDepartment[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    const uploadedUids = useRef<Set<string>>(new Set());
    const uploadTimeout = useRef<any>(null);

    const correspondenceId = '1';

    const { isLoading: isCorrespondenceLoading } = useGetQuery({
        url: ApiRoutes.GET_CORRESPONDENCE_BY_ID.replace(':id', correspondenceId),
        options: {
            onSuccess: (response) => {
                const attachments = response?.data?.attachments || response?.attachments;
                if (attachments) {
                    setUploadedFiles(attachments);
                }
            }
        }
    });

    const visaValue = Form.useWatch('visa', form);

    const { mutate: submitResolution, isPending: isSubmitting } = useMutationQuery({
        url: ApiRoutes.CREATE_RESOLUTION.replace(':id', correspondenceId),
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

    const { mutate: uploadFilesBulk, isPending: isUploading } = useMutationQuery({
        url: ApiRoutes.CREATE_ATTACHMENTS_BULK.replace(':id', correspondenceId),
        method: 'POST',
        messages: {
            success: 'Файлы успешно загружены',
            error: 'Ошибка при загрузке файлов'
        },
        queryOptions: {
            onSuccess: (newAttachments: any[]) => {
                setUploadedFiles(prev => [...prev, ...newAttachments]);
            }
        }
    });

    const { mutate: deleteAttachment } = useMutationQuery({
        url: (id) => ApiRoutes.DELETE_ATTACHMENT.replace(':id', String(id)),
        method: 'DELETE',
        messages: {
            success: 'Файл удален',
            error: 'Ошибка при удалении файла'
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

    const handleRemoveFile = (id: number) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
        deleteAttachment(id as any);
    };

    const handleUploadChange = (info: any) => {
        if (info.file.status === 'removed') return;

        if (uploadTimeout.current) clearTimeout(uploadTimeout.current);

        uploadTimeout.current = setTimeout(() => {
            const filesToUpload = info.fileList.filter((f: any) => 
                f.originFileObj && !uploadedUids.current.has(f.uid)
            );

            if (filesToUpload.length === 0) return;

            filesToUpload.forEach((f: any) => uploadedUids.current.add(f.uid));

            const formData = new FormData();
            filesToUpload.forEach((f: any) => {
                formData.append('files[]', f.originFileObj, f.name);
            });

            uploadFilesBulk(formData as any);
            uploadTimeout.current = null;
        }, 300);
    };

    const onFinish = (values: any) => {
        submitResolution(values);
    };

    const hasSelection = selectedDepts.length > 0 || selectedUsers.length > 0;
    const isTotalPending = isSubmitting || originalIsPending || isUploading || isCorrespondenceLoading;

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
