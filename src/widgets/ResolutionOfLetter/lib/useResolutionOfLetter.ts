import { useState, useRef } from "react";
import { Form, message } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import { useMutationQuery, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IDepartment, IUser } from "@features/SelectExecutors";
import { IAttachment } from "../model";

/**
 * Хук для управления логикой создания резолюции.
 * Инкапсулирует состояние формы, выбор исполнителей и работу с файлами.
 */
export const useResolutionOfLetter = () => {
    // Форма Ant Design
    const [form] = Form.useForm();
    
    // Состояние модалки выбора исполнителей
    const [executorModalOpen, setExecutorModalOpen] = useState(false);
    
    // Выбранные отделы и сотрудники
    const [selectedDepts, setSelectedDepts] = useState<IDepartment[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
    
    // ID главных исполнителей (человек или отдел)
    const [mainUserId, setMainUserId] = useState<number | undefined>();
    const [mainDeptId, setMainDeptId] = useState<number | undefined>();
    
    // Состояния для хранения файлов
    const [uploadedFiles, setUploadedFiles] = useState<IAttachment[]>([]);

    // Реф для контроля частоты обновлений при загрузке файлов
    const uploadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ID текущего письма (в реальном приложении получаем из контекста или пропсов)
    const correspondenceId = '1';

    // Запрос данных письма для получения списка вложений
    const { isLoading: isCorrespondenceLoading } = useGetQuery({
        url: ApiRoutes.GET_CORRESPONDENCE_BY_ID.replace(':id', correspondenceId),
        options: {
            onSuccess: (response: Record<string, unknown>) => {
                const data = (response?.data || response) as Record<string, unknown>;
                const attachments = data?.attachments as IAttachment[];
                if (attachments) {
                    setUploadedFiles(attachments);
                }
            }
        }
    });

    // Мутация для создания основной записи резолюции
    const { mutate: chooseResolutionMutate, isPending: chooseResolutionIsPending, isAllowed } = useMutationQuery({
        url: ApiRoutes.CREATE_RESOLUTION,
        method: "POST",
        preload: true,
        preloadConditional: ["correspondence.create"],
        messages: {
            invalidate: [ApiRoutes.GET_CORRESPONDENCES]
        }
    });

    // Наблюдение за полем "Виза" для динамического изменения UI
    const visaValue = Form.useWatch('visa', form);

    // Мутация для отправки формы создания резолюции
    const { mutate: submitResolution, isPending: isSubmitting } = useMutationQuery({
        url: ApiRoutes.CREATE_RESOLUTION.replace(':id', correspondenceId),
        method: 'POST',
        queryOptions: {
            onSuccess: (data: Record<string, unknown>) => {
                // Вызываем мутацию создания основной связи
                chooseResolutionMutate(data as any);
                message.success('Резолюция успешно создана');
            },
            onError: () => {
                message.error('Ошибка при создании резолюции');
            }
        }
    });

    // Мутация для массовой загрузки файлов
    const { mutate: uploadFilesBulk, isPending: isUploading } = useMutationQuery({
        url: ApiRoutes.CREATE_ATTACHMENTS_BULK.replace(':id', correspondenceId),
        method: 'POST',
        queryOptions: {
            onSuccess: (response: Record<string, unknown>) => {
                const newAttachments = (response?.data || response) as IAttachment[];
                if (Array.isArray(newAttachments)) {
                    setUploadedFiles(prev => [...prev, ...newAttachments]);
                }
            }
        }
    });

    // Мутация для удаления файла
    const { mutate: deleteAttachment } = useMutationQuery({
        url: (id) => ApiRoutes.DELETE_ATTACHMENT.replace(':id', String(id)),
        method: 'DELETE',
    });

    // --- Обработчики событий ---

    /**
     * Выбор исполнителей в модальном окне.
     * Синхронизирует локальное состояние с полями формы.
     */
    const handleExecutorsSelected = (departments: IDepartment[], users: IUser[], mainUid?: number, mainDid?: number) => {
        setSelectedDepts(departments);
        setSelectedUsers(users);
        setMainUserId(mainUid);
        setMainDeptId(mainDid);
        
        form.setFieldsValue({
            assignee_departments: departments?.map(d => d.id),
            assignee_users: users?.map(u => u.id),
            main_assignee_user_id: mainUid,
            main_assignee_dept_id: mainDid
        });
        
        setExecutorModalOpen(false);
    };

    /**
     * Удаление отдела из списка выбранных.
     */
    const handleRemoveDept = (id: number) => {
        const newDepts = selectedDepts?.filter(d => d.id !== id);
        setSelectedDepts(newDepts);
        
        if (mainDeptId === id) {
            setMainDeptId(undefined);
            form.setFieldValue('main_assignee_dept_id', undefined);
        }
        form.setFieldValue('assignee_departments', newDepts?.map(d => d.id));
    };

    /**
     * Удаление сотрудника из списка выбранных.
     */
    const handleRemoveUser = (id: number) => {
        const newUsers = selectedUsers?.filter(u => u.id !== id);
        setSelectedUsers(newUsers);
        
        if (mainUserId === id) {
            setMainUserId(undefined);
            form.setFieldValue('main_assignee_user_id', undefined);
        }
        form.setFieldValue('assignee_users', newUsers.map(u => u.id));
    };

    /**
     * Переключение статуса главного исполнителя (сотрудник).
     */
    const handleSetMainUser = (id: number) => {
        const newId = mainUserId === id ? undefined : id;
        setMainUserId(newId);
        setMainDeptId(undefined); 
        form.setFieldsValue({
            main_assignee_user_id: newId,
            main_assignee_dept_id: undefined
        });
    };

    /**
     * Переключение статуса главного исполнителя (отдел).
     */
    const handleSetMainDept = (id: number) => {
        const newId = mainDeptId === id ? undefined : id;
        setMainDeptId(newId);
        setMainUserId(undefined);
        form.setFieldsValue({
            main_assignee_dept_id: newId,
            main_assignee_user_id: undefined
        });
    };

    /**
     * Удаление файла.
     */
    const handleRemoveFile = (id: number) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
        deleteAttachment(id as any);
    };

    /**
     * Обработчик загрузки новых файлов.
     */
    const handleUploadChange = (info: UploadChangeParam) => {
        const { fileList } = info;
        
        if (uploadTimeout.current) {
            clearTimeout(uploadTimeout.current);
        }

        uploadTimeout.current = setTimeout(() => {
            const newFiles = fileList
                .filter(file => file.status === 'done' || file.originFileObj)
                .map(file => ({
                    id: Number(file.uid) || Math.random(),
                    name: file.name,
                    url: (file.response as Record<string, unknown>)?.url || '',
                    size: file.size,
                    type: file.type
                } as IAttachment));

            setUploadedFiles(prev => [...prev, ...newFiles]);
        }, 300);
    };

    /**
     * Отправка финальной формы.
     */
    const onFinish = (values: Record<string, unknown>) => {
        // Формируем финальный объект данных
        const payload = {
            ...values,
            main_user_id: mainUserId,
            main_dept_id: mainDeptId,
            attachments: uploadedFiles.map(f => f.id)
        };
        
        submitResolution(payload as any);
    };

    // Флаги состояния для UI
    const hasSelection = selectedDepts.length > 0 || selectedUsers.length > 0;
    const isTotalPending = isSubmitting || chooseResolutionIsPending || isUploading || isCorrespondenceLoading;

    return {
        form,
        executorModalOpen,
        setExecutorModalOpen,
        selectedDepts,
        selectedUsers,
        mainUserId,
        mainDeptId,
        uploadedFiles,
        visaValue,
        isTotalPending,
        isAllowed,
        hasSelection,
        handleExecutorsSelected,
        handleRemoveDept,
        handleRemoveUser,
        handleSetMainUser,
        handleSetMainDept,
        handleRemoveFile,
        handleUploadChange,
        onFinish
    };
};
