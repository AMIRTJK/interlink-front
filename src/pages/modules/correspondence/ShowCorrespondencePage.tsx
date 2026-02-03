import React from "react";
import { matchPath, useLocation, useParams } from "react-router-dom";
import {
  CorrespondenceForm,
  CorrespondenceFormData,
  CorrespondenceType,
} from "@widgets/CorrespondenceForm";
import { Spin } from "antd";
import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { InternalCorrespondece } from "@widgets/InternalCorrespondece";

interface ShowCorrespondencePageProps {
  type?: CorrespondenceType;
}

export const ShowCorrespondencePage: React.FC<ShowCorrespondencePageProps> = ({
  type = "incoming",
}) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const hiddenPatterns = [
    "/modules/correspondence/outgoing/create",
    "/modules/correspondence/outgoing/:id",
  ];

  const shouldHideUI = hiddenPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, location.pathname),
  );

  const currentApi = shouldHideUI
    ? ApiRoutes.GET_INTERNAL_BY_ID
    : ApiRoutes.GET_CORRESPONDENCE_BY_ID;

  const currentParam = shouldHideUI ? {} : { view: "full" };

  const { isLoading, data: correspondenceData } = useGetQuery({
    url: currentApi.replace(":id", String(id || "")),
    params: currentParam,
  });

  console.log(correspondenceData);

  const handleFinish = (values: CorrespondenceFormData) => {
    console.log("Updating:", values);
  };

  if (isLoading) return <Spin />;

  const title =
    type === "incoming" ? `Входящее письмо #${id}` : `Исходящее письмо #${id}`;

  const data = correspondenceData?.data;

  const shouldOpenExecution = (location.state as { openExecution?: boolean })
    ?.openExecution;

  if (shouldHideUI) {
    // show||create
    return <InternalCorrespondece mode="show" />;
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
