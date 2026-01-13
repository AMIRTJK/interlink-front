import { Modal } from "antd";
import { useResolutionOfLetter } from "./lib/useResolutionOfLetter";
import { RenderField } from "./lib/renderField";
import './ui/ResolutionOfLetter.css';

interface IProps {
    isLetterExecutionVisible: boolean;
    setIsLetterExecutionVisible: (visible: boolean) => void;
}

export const ResolutionOfLetter: React.FC<IProps> = ({ setIsLetterExecutionVisible }) => {
    const {
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
    } = useResolutionOfLetter();

    return (
        <div className="resolution-of-letter__container">
            <Modal
                title="Резолюция"
                open={true}
                width={1200}
                onCancel={() => setIsLetterExecutionVisible(false)}
                footer={null}
            >
                <RenderField 
                    resolutionerName={'km'}
                    form={form}
                    executorModalOpen={executorModalOpen}
                    setExecutorModalOpen={setExecutorModalOpen}
                    selectedDepts={selectedDepts}
                    selectedUsers={selectedUsers}
                    uploadedFiles={uploadedFiles}
                    visaValue={visaValue}
                    isTotalPending={isTotalPending ?? false}
                    isAllowed={isAllowed ?? false}
                    hasSelection={hasSelection}
                    handleExecutorsSelected={handleExecutorsSelected}
                    handleRemoveDept={handleRemoveDept}
                    handleRemoveUser={handleRemoveUser}
                    handleRemoveFile={handleRemoveFile}
                    handleUploadChange={handleUploadChange}
                    onFinish={onFinish}
                />
            </Modal>
        </div>
    );
};
