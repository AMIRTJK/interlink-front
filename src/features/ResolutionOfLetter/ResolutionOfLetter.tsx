import { JSX } from "react";
import { RenderField } from "./lib";
import { Modal } from "antd";
import './ResolutionOfLetter.css'
export const ResolutionOfLetter:React.FC<{setIsLetterExecutionVisible: React.Dispatch<React.SetStateAction<boolean>>}> = ({setIsLetterExecutionVisible}):JSX.Element => {
    return (
        <div className="resolution-of-letter__container">
            <Modal
            title="Резолюция"
            open={true}
            width={1376}
            onCancel={() => setIsLetterExecutionVisible(false)}
            footer={null}
            >
                <RenderField setIsLetterExecutionVisible={setIsLetterExecutionVisible} resolutionerName="Резолюционер" />
            </Modal>

        </div>
    );
};