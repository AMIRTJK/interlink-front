import { Modal } from "antd";
import { useResolutionOfLetter } from "./lib/useResolutionOfLetter";
import { RenderField } from "./lib/renderField";
import { tokenControl } from "@shared/lib";
import "./ui/ResolutionOfLetter.css";

// Свойства главного компонента виджета
interface IProps {
  isLetterExecutionVisible: boolean; // Видимость модалки создания
  setIsLetterExecutionVisible: (visible: boolean) => void; // Функция переключения видимости
}

// Главный входной компонент для работы с резолюциями
export const ResolutionOfLetter: React.FC<IProps> = ({
  isLetterExecutionVisible,
  setIsLetterExecutionVisible,
}) => {
  // Получаем данные текущего пользователя для отображения автора
  const currentUser = tokenControl.getUserData();
  const currentUserName = currentUser?.full_name || "Сотрудник";

  // Вся логика вынесена в отдельный хук для чистоты
  const {
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
    onFinish,
  } = useResolutionOfLetter();

  return (
    <div className="resolution-of-letter__container">
      {/* Модальное окно создания/просмотра формы резолюции */}
      <Modal
        open={isLetterExecutionVisible}
        width="100%"
        onCancel={() => setIsLetterExecutionVisible(false)}
        footer={null}
        className="resolution-execution-modal"
        centered
      >
        {/* Отрисовка полей и логика переключения между формой и предпросмотром */}
        <RenderField
          resolutionerName={currentUserName}
          form={form}
          executorModalOpen={executorModalOpen}
          setExecutorModalOpen={setExecutorModalOpen}
          selectedDepts={selectedDepts}
          selectedUsers={selectedUsers}
          mainUserId={mainUserId}
          mainDeptId={mainDeptId}
          uploadedFiles={uploadedFiles}
          isTotalPending={isTotalPending ?? false}
          isAllowed={isAllowed ?? false}
          hasSelection={hasSelection}
          handleExecutorsSelected={handleExecutorsSelected}
          handleRemoveUser={handleRemoveUser}
          handleRemoveDept={handleRemoveDept}
          handleSetMainUser={handleSetMainUser}
          handleSetMainDept={handleSetMainDept}
          handleRemoveFile={handleRemoveFile}
          handleUploadChange={handleUploadChange}
          onFinish={(values) => {
            onFinish(values);
            // Закрываем окно после успешной отправки формы
            setIsLetterExecutionVisible(false);
          }}
        />
      </Modal>
    </div>
  );
};
