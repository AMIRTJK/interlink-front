import { JSX } from "react";
import { RenderField } from "./lib";

export const ResolutionOfLetter:React.FC<{setIsLetterExecutionVisible: React.Dispatch<React.SetStateAction<boolean>>}> = ({setIsLetterExecutionVisible}):JSX.Element => {
    return (
        <div className="resolution-of-letter__container">
            <RenderField setIsLetterExecutionVisible={setIsLetterExecutionVisible} resolutionerName="Резолюционер" />
        </div>
    );
};