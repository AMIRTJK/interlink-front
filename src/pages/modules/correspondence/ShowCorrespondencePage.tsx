import React from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  CorrespondenceForm,
  CorrespondenceFormData,
} from "@widgets/CorrespondenceForm";
import { Spin } from "antd";
import { ApiRoutes } from "@shared/api";
import { useCorrespondenceRoute, useGetQuery } from "@shared/lib";
import { InternalCorrespondece } from "@widgets/InternalCorrespondece";

interface ShowCorrespondencePageProps {
  type?: string;
}

export const ShowCorrespondencePage: React.FC<ShowCorrespondencePageProps> = ({
  type = "external-incoming",
}) => {
  const { id } = useParams<{ id: string }>();

  const location = useLocation();

  const { shouldHideUI } = useCorrespondenceRoute();

  const isInternalView = type === "internal-incoming" || shouldHideUI;

  const currentApi = shouldHideUI
    ? ApiRoutes.GET_INTERNAL_BY_ID
    : ApiRoutes.GET_CORRESPONDENCE_BY_ID;

  const currentParam = shouldHideUI ? {} : { view: "full" };

  const { isLoading, data: correspondenceData } = useGetQuery({
    url: currentApi.replace(":id", String(id || "")),
    params: currentParam,
  });

  const handleFinish = (values: CorrespondenceFormData) => {
    console.log("Updating:", values);
  };

  if (isLoading) return <Spin />;

  const title = type.includes("incoming")
    ? `Входящее письмо #${id}`
    : `Исходящее письмо #${id}`;

  const data = correspondenceData?.data;

  const shouldOpenExecution = (location.state as { openExecution?: boolean })
    ?.openExecution;

  if (isInternalView) {
    // show||create
    return (
      <InternalCorrespondece
        mode="show"
        initialData={correspondenceData?.data}
        isLoading={isLoading}
        type={type}
      />
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 h-full overflow-hidden">
        <CorrespondenceForm
          type={type}
          title={title}
          initialValues={data}
          onFinish={handleFinish}
          isReadOnly={false}
          isLoading={isLoading}
          isAllowed={true}
          initialExecutionOpen={shouldOpenExecution}
          variant="view"
        />
      </div>
    </div>
  );
};
