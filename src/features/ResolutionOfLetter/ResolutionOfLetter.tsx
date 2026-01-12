import { JSX } from "react";
import { RenderField } from "./lib";
import { Modal } from "antd";
import './ResolutionOfLetter.css'
export const ResolutionOfLetter:React.FC<{isLetterExecutionVisible: boolean, setIsLetterExecutionVisible: React.Dispatch<React.SetStateAction<boolean>>}> = ({setIsLetterExecutionVisible}):JSX.Element => {
    return (
        <div className="resolution-of-letter__container">
            <Modal
            title="Резолюция"
            open={true}
            width={1200}
            height={300}
            onCancel={() => setIsLetterExecutionVisible(false)}
            footer={null}
            >
                <RenderField resolutionerName="Резолюционер" />
            </Modal>

        </div>
    );
};