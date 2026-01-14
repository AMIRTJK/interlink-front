import React from "react";
import { Modal } from "antd";
import { Breadcrumbs } from "@shared/ui";
import { IResolution } from "../model";
import { ResolutionExecutionLayout } from "./ResolutionExecutionLayout";

interface IProps {
    open: boolean;
    onCancel: () => void;
    resolution: IResolution;
}

// Главный компонент режима просмотра резолюции
export const ResolutionExecution: React.FC<IProps> = ({ open, onCancel, resolution }) => {
    return (
        <Modal
            title={
                <Breadcrumbs 
                    items={[
                        { label: 'Документ', onClick: onCancel },
                        { label: 'Область визирующего', isActive: true },
                        { label: 'Резолюция', isActive: true }
                    ]} 
                />
            }
            open={open}
            onCancel={onCancel}
            width={1400}
            footer={null}
            className="resolution-execution-modal"
            centered
        >
            <ResolutionExecutionLayout resolution={resolution} />
        </Modal>
    );
};
