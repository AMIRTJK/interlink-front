import { useState, useRef } from "react";
import { Form } from "antd";
import { useMutationQuery, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IDepartment, IUser } from "@features/SelectExecutors";

export const useResolutionOfLetter = () => {
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
            onSuccess: (response: any) => {
                const attachments = response?.data?.attachments || response?.attachments;
                if (attachments) {
                    setUploadedFiles(attachments);
                }
            }
        }
    });

    const { mutate: chooseResolutionMutate, isPending: chooseResolutionIsPending, isAllowed } = useMutationQuery({
        url: ApiRoutes.CREATE_RESOLUTION,
        method: "POST",
        preload: true,
        preloadConditional: ["correspondence.create"],
        messages: {
            invalidate: [ApiRoutes.GET_CORRESPONDENCES]
        }
    });

    const visaValue = Form.useWatch('visa', form);

    const { mutate: submitResolution, isPending: isSubmitting } = useMutationQuery({
        url: ApiRoutes.CREATE_RESOLUTION.replace(':id', correspondenceId),
        method: 'POST',
        queryOptions: {
            onSuccess: (data: any) => {
                chooseResolutionMutate(data);
            }
        }
    });

    const { mutate: uploadFilesBulk, isPending: isUploading } = useMutationQuery({
        url: ApiRoutes.CREATE_ATTACHMENTS_BULK.replace(':id', correspondenceId),
        method: 'POST',
        queryOptions: {
            onSuccess: (newAttachments: any[]) => {
                setUploadedFiles(prev => [...prev, ...newAttachments]);
            }
        }
    });

    const { mutate: deleteAttachment } = useMutationQuery({
        url: (id) => ApiRoutes.DELETE_ATTACHMENT.replace(':id', String(id)),
        method: 'DELETE',
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


    // Состояние для открытия режима просмотра (Execution View)
    const [executionModalOpen, setExecutionModalOpen] = useState(false);

    const onFinish = (values: any) => {
        // Запрос отправляется, но мы показываем результат сразу 
        submitResolution(values);
        setExecutionModalOpen(true);
    };

    const hasSelection = selectedDepts.length > 0 || selectedUsers.length > 0;
    const isTotalPending = isSubmitting || chooseResolutionIsPending || isUploading || isCorrespondenceLoading;

    return {
        form,
        executorModalOpen,
        setExecutorModalOpen,
        executionModalOpen,      // <-- Новое состояние
        setExecutionModalOpen,   // <-- Сеттер
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
    };
};
