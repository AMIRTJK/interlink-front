import { ArrowLeftOutlined } from "@ant-design/icons";
import { DetailsOfLetter } from "@features/detailsOfLetter/DetailsOfLetter";
import { LetterExecution } from "@features/ResolutionCard";
import { ResolutionOfLetter } from "@features/ResolutionOfLetter";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { useNavigate } from "react-router";
import { Button, Form } from "antd";
import { useState } from "react";
import { If } from "@shared/ui";

export const CreateCorrespondencePage = ({
  type,
}: {
  type: "incoming" | "outgoing";
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { mutate: createLetterMutate, isPending: createLetterIsPending, isAllowed } =
    useMutationQuery({
      url: ApiRoutes.CREATE_CORRESPONDENCES,
      method: "POST",
      preload: true,
      preloadConditional: ["correspondence.create"],
      messages: {
        success: "Письмо успешно создано",
        error: "Ошибка при создании письма",
      },
    });

  const handleBack = () => navigate(-1);

  const onSubmit = (values: {[key:string]:string|number}) => {
    createLetterMutate(values);
  };

  const [isLetterExecutionVisible, setIsLetterExecutionVisible] = useState(false);
  return (
    <div className="p-6 bg-white rounded-lg">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
      />
      <h1 className="text-xl font-bold mb-4">
        Создание {type === "incoming" ? "входящего" : "исходящего"} письма
      </h1>
      <Form form={form} onFinish={onSubmit} layout="vertical">
        <div className="flex flex-col gap-8 p-6 items-center">
          <DetailsOfLetter isAllowed={isAllowed} createLetterIsPending={createLetterIsPending} mode="create" form={form} /> 
          <ResolutionOfLetter setIsLetterExecutionVisible={setIsLetterExecutionVisible} />
          <If is={isLetterExecutionVisible}>
            <LetterExecution />
          </If>
        </div>
      </Form>
    </div>
  );
};