import { ArrowLeftOutlined } from "@ant-design/icons";
import { DetailsOfLetter } from "@features/detailsOfLetter/DetailsOfLetter";
import { LetterExecution } from "@features/ResolutionCard";
import { ResolutionOfLetter } from "@features/ResolutionOfLetter";
import { Button } from "@shared/ui";
import { useNavigate } from "react-router";

export const CreateCorrespondencePage = ({
  type,
}: {
  type: "incoming" | "outgoing";
}) => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <div className="p-6 bg-white rounded-lg">
      <Button
        type="text"
        antdIcon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="flex items-center justify-center"
      />
      <h1 className="text-xl font-bold mb-4">
        Создание {type === "incoming" ? "входящего" : "исходящего"} письма
      </h1>
      <div className="flex flex-col gap-8 p-6 items-center">
        <ResolutionOfLetter />
        <DetailsOfLetter mode="show" />
        <LetterExecution />
      </div>
    </div>
  );
};
