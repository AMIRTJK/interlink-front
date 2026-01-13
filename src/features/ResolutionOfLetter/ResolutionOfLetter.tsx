import { ResolutionContent } from "./lib";
import { Modal } from "antd";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import './ResolutionOfLetter.css'
export const ResolutionOfLetter:React.FC<{isLetterExecutionVisible: boolean, setIsLetterExecutionVisible: React.Dispatch<React.SetStateAction<boolean>>}> = ({setIsLetterExecutionVisible}) => {
    const {mutate: chooseResolutionMutate, isPending: chooseResolutionIsPending, isAllowed }=useMutationQuery({
  url: `ApiRoutes.CREATE_RESOLUTION`,
  method: "POST",
  preload: true,
  preloadConditional: ["correspondence.create"],
  messages:{
    invalidate:[ApiRoutes.GET_CORRESPONDENCES]
  }
})
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
                <ResolutionContent resolutionerName="Резолюционер" mutate={chooseResolutionMutate} isPending={chooseResolutionIsPending} isAllowed={isAllowed} />
            </Modal>

        </div>
    );
};