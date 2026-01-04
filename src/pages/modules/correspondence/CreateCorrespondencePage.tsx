import { ArrowLeftOutlined } from "@ant-design/icons";
import { DetailsOfLetter } from "@features/detailsOfLetter/DetailsOfLetter";
import { LetterExecution } from "@features/ResolutionCard";
import { ResolutionOfLetter } from "@features/ResolutionOfLetter";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { useNavigate } from "react-router";
import { Button, Form } from "antd";

export const CreateCorrespondencePage = ({
  type,
}: {
  type: "incoming" | "outgoing";
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // одна форма на всю страницу

  const { mutate: createLetterMutate, isPending: createLetterIsPending, isAllowed } =
  // Исправить---
    useMutationQuery({
      url: ApiRoutes.CREATE_LETTER,
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
          <DetailsOfLetter mode="create" form={form} /> 
          <LetterExecution />
          <ResolutionOfLetter />

          <Button
            type="primary"
            htmlType="submit"
            loading={createLetterIsPending}
            disabled={!isAllowed} 
            className="mt-6 w-full max-w-xs"
          >
            Создать письмо
          </Button>
        </div>
      </Form>
    </div>
  );
};