import { ArrowLeftOutlined } from "@ant-design/icons";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { useNavigate } from "react-router";
import { Button } from "antd";
import {
  CorrespondenceForm,
  CorrespondenceFormData,
} from "@widgets/CorrespondenceForm";

export const CreateCorrespondencePage = ({
  type,
}: {
  type: "incoming" | "outgoing";
}) => {
  const navigate = useNavigate();

  const {
    mutate: createLetterMutate,
    isPending: createLetterIsPending,
    isAllowed,
  } = useMutationQuery({
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

  const title =
    type === "incoming" ? "Новое входящее письмо" : "Новое исходящее письмо";

  const handleFinish = (values: CorrespondenceFormData) => {
    createLetterMutate(values);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="text-gray-500 hover:text-gray-800 hover:bg-gray-100"
        >
          Назад
        </Button>
      </div>

      <div className="flex-1 h-full overflow-hidden">
        <CorrespondenceForm
          type={type}
          title={title}
          onFinish={handleFinish}
          isLoading={createLetterIsPending}
          isReadOnly={false}
          isAllowed={isAllowed}
        />
        {/* <h1 className="text-xl font-bold mb-4">
        Создание {type === "incoming" ? "входящего" : "исходящего"} письма
      </h1>
      <Form form={form} onFinish={onSubmit} layout="vertical">
        <div className="flex flex-col gap-8 p-6">
          <DetailsOfLetter
            isAllowed={isAllowed}
            createLetterIsPending={createLetterIsPending}
            mode="create"
            form={form}
          />
          <LetterExecution />
        </div>
      </Form> */}
      </div>
    </div>
  );
};
