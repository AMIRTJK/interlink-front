import { ApiRoutes } from "@shared/api";
import { AppRoutes } from "@shared/config";
import { useMutationQuery } from "@shared/lib";
import {
  CorrespondenceForm,
  CorrespondenceFormData,
} from "@widgets/CorrespondenceForm";
import { CreateInternalCorrespondence } from "@widgets/CreateInternalCorrespondence";
import { useNavigate } from "react-router-dom";

export const CreateCorrespondencePage = ({ type }: { type: string }) => {
  const navigate = useNavigate();

  const getRegistryRoute = (t: string) => {
    if (t.includes("internal-incoming")) return AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING;
    if (t.includes("internal-outgoing")) return AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING;
    if (t.includes("external-incoming")) return AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING;
    if (t.includes("external-outgoing")) return AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING;
    return AppRoutes.CORRESPONDENCE;
  };

  const handleBack = () => {
    navigate(getRegistryRoute(type));
  };

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

  const title = type.includes("incoming")
    ? "Новое входящее письмо"
    : "Новое исходящее письмо";

  const handleFinish = (values: CorrespondenceFormData) => {
    createLetterMutate(values);
  };

  const isInternal = type.includes("internal");

  if (isInternal) {
    return (
      <CreateInternalCorrespondence 
        onBack={handleBack} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 h-full overflow-hidden">
        <CorrespondenceForm
          type={type}
          title={title}
          onFinish={handleFinish}
          onBack={handleBack}
          isLoading={createLetterIsPending}
          isReadOnly={false}
          isAllowed={isAllowed}
          variant="create"
        />
      </div>
    </div>
  );
};
