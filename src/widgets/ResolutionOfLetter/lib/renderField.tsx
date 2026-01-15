import { Button, FormInstance } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { SelectExecutorsModal, IDepartment, IUser } from "@features/SelectExecutors";
import { If } from "@shared/ui";
import { ResolutionAuthor } from "../ui/ResolutionAuthor";
import { ResolutionForm } from "../ui/ResolutionForm";
import { IAttachment } from "../model";
import usersIcon from '../../../assets/icons/users.svg'

// Свойства для рендеринга полей виджета
interface IRenderFieldProps {
    resolutionerName: string; // Имя автора резолюции
    form: FormInstance; // Форма
    executorModalOpen: boolean; // Состояние модалки выбора
    setExecutorModalOpen: (open: boolean) => void; // Функция открытия модалки
    selectedDepts: IDepartment[]; // Список отделов
    selectedUsers: IUser[]; // Список пользователей
    mainUserId?: number; // Главный юзер
    mainDeptId?: number; // Главный отдел
    uploadedFiles: IAttachment[]; // Загруженные файлы
    isTotalPending: boolean; // Общий статус загрузки
    isAllowed: boolean; // Доступность действий
    hasSelection: boolean; // Выбран ли кто-то
    handleExecutorsSelected: (departments: IDepartment[], users: IUser[], mainUid?: number, mainDid?: number) => void;
    handleRemoveUser: (id: number) => void;
    handleRemoveDept: (id: number) => void;
    handleSetMainUser: (id: number) => void;
    handleSetMainDept: (id: number) => void;
    handleRemoveFile: (id: number) => void;
    handleUploadChange: (info: any) => void;
    onFinish: (values: Record<string, unknown>) => void;
}

// Компонент, отвечающий за отрисовку формы и модалок внутри виджета
export const RenderField: React.FC<IRenderFieldProps> = ({
    resolutionerName,
    form,
    executorModalOpen,
    setExecutorModalOpen,
    selectedDepts,
    selectedUsers,
    mainUserId,
    mainDeptId,
    uploadedFiles,
    isTotalPending,
    isAllowed,
    hasSelection,
    handleExecutorsSelected,
    handleRemoveUser,
    handleRemoveDept,
    handleSetMainUser,
    handleSetMainDept,
    handleRemoveFile,
    handleUploadChange,
    onFinish
}) => {
    return (
        <>
            {/* Модальное окно для выбора исполнителей (из фичи SelectExecutors) */}
            <SelectExecutorsModal 
                open={executorModalOpen} 
                onCancel={() => setExecutorModalOpen(false)}
                onOk={handleExecutorsSelected}
                initialSelectedDepartments={selectedDepts}
                initialSelectedUsers={selectedUsers}
                initialMainUserId={mainUserId}
                initialMainDeptId={mainDeptId}
            />
            
            <div className="resolution__content">
                
                {/* Левая часть: автор и форма ввода */}
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
                        selectedDepts={selectedDepts}
                        selectedUsers={selectedUsers}
                        mainUserId={mainUserId}
                        mainDeptId={mainDeptId}
                        onRemoveUser={handleRemoveUser}
                        onRemoveDept={handleRemoveDept}
                        onSetMainUser={handleSetMainUser}
                        onSetMainDept={handleSetMainDept}
                    />
                </div>

                {/* Правая часть: заглушка или информация о выборе */}
                <div className="resolution__right-content">
                    
                    {/* Если никто не выбран - показываем призыв к действию */}
                    <If is={!hasSelection}>
                        <div className="resolution__right-content-action">
                            <img className="resolution__right-content-action-icon" src={usersIcon} alt="users"/>
                            <h3 className="resolution__right-title">Исполнители не назначены</h3>
                            <p className="resolution__right-text">Выберите исполнителей слева</p>
                            <Button 
                                icon={<PlusOutlined />} 
                                type="link" 
                                className="resolution__button-executor-right" 
                                onClick={() => setExecutorModalOpen(true)}
                            >
                                Выбрать исполнителя
                            </Button>
                        </div>
                    </If>

                    {/* Если выбор сделан - здесь может быть доп. контент (сейчас пусто) */}
                    <If is={hasSelection}>
                        <div className="w-full h-full" />
                    </If>
                </div>
            </div>
        </>
    );
};
