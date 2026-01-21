import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CorrespondenceForm,
  CorrespondenceFormData,
  CorrespondenceType,
} from "@widgets/CorrespondenceForm";
import { Button, Spin } from "antd";
import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface ShowCorrespondencePageProps {
  type?: CorrespondenceType;
}

export const ShowCorrespondencePage: React.FC<ShowCorrespondencePageProps> = ({
  type = "incoming",
}) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const { isLoading, data: correspondenceData } = useGetQuery({
    url: ApiRoutes.GET_CORRESPONDENCE_BY_ID.replace(":id", String(id || "")),
    params: { view: "full" },
  });

  const handleFinish = (values: CorrespondenceFormData) => {
    console.log("Updating:", values);
  };

  if (isLoading) return <Spin />;

  const title =
    type === "incoming" ? `Входящее письмо #${id}` : `Исходящее письмо #${id}`;

  const { data } = correspondenceData;

  const shouldOpenExecution = (location.state as { openExecution?: boolean })
    ?.openExecution;


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
        />
      </div>
    </div>
  );
};
