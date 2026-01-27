import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import {
  CorrespondenceForm,
  CorrespondenceFormData,
} from "@widgets/CorrespondenceForm";
import { InternalCorrespondece } from "@widgets/InternalCorrespondece/ui";
import { matchPath, useLocation } from "react-router";

export const CreateCorrespondencePage = ({
  type,
}: {
  type: "incoming" | "outgoing";
}) => {
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

  // const handleBack = () => navigate(-1);

  const title =
    type === "incoming" ? "Новое входящее письмо" : "Новое исходящее письмо";

  const handleFinish = (values: CorrespondenceFormData) => {
    createLetterMutate(values);
  };

  const location = useLocation();

  const hiddenPatterns = [
    "/modules/correspondence/outgoing/create",
    "/modules/correspondence/outgoing/:id",
  ];

  const shouldHideUI = hiddenPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, location.pathname),
  );

  if (shouldHideUI) {
    return (
      <div>
        <InternalCorrespondece />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 h-full overflow-hidden">
        <CorrespondenceForm
          type={type}
          title={title}
          onFinish={handleFinish}
          isLoading={createLetterIsPending}
          isReadOnly={false}
          isAllowed={isAllowed}
          variant="create"
        />
      </div>
    </div>
  );
};
