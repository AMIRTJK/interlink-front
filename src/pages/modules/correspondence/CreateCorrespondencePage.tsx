import { ApiRoutes } from "@shared/api";
import { AppRoutes } from "@shared/config";
import { useMutationQuery, determineCorrespondenceBackRoute } from "@shared/lib";
import {
  CorrespondenceForm,
  CorrespondenceFormData,
} from "@widgets/CorrespondenceForm";
import { CreateInternalCorrespondence } from "@widgets/CreateInternalCorrespondence";
import { useNavigate, useLocation } from "react-router-dom";

export const CreateCorrespondencePage = ({ type }: { type: string }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const locState =
      (location.state as {
        fromRegistry?: string;
        lastOpenedId?: string | number;
      }) || {};
    const fromState = locState.fromRegistry;
    const lastOpenedId = locState.lastOpenedId;
    const backRoute = determineCorrespondenceBackRoute({
      type,
      fromState,
    });
    navigate(backRoute, {
      state: { highlightedId: lastOpenedId ? String(lastOpenedId) : undefined },
    });
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
