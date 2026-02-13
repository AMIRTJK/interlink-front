import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { ApiRoutes } from "@shared/api";
import { NewRegistry } from "./NewRegistry";

interface IncomingTableWrapperProps {
  type: string;
  createButtonText?: string;
  baseParams?: Record<string, unknown>;
}

export const NewCorrespondenceTableWrapper = ({
  type,
  createButtonText,
  baseParams,
}: IncomingTableWrapperProps) => {
  const [searchParams] = useSearchParams();
  const folder_id = searchParams.get("folder_id");

  const { params, url } = useMemo(() => {
    let currentParams = { ...baseParams };

    if (folder_id) {
      currentParams.folder_id = parseInt(folder_id, 10);
    }

    // Выбор URL на основе типа (Internal API)
    if (type === "internal-incoming") {
      return {
        params: currentParams,
        url: ApiRoutes.GET_INTERNAL_INCOMING,
      };
    }

    if (type === "internal-outgoing") {
      return {
        params: currentParams,
        url: ApiRoutes.GET_INTERNAL_OUTGOING,
      };
    }

    if (type === "internal-drafts") {
      return {
        params: currentParams,
        url: ApiRoutes.GET_INTERNAL_DRAFTS,
      };
    }

    if (type === "internal-to-sign") {
      return {
        params: currentParams,
        url: ApiRoutes.GET_INTERNAL_TO_SIGN,
      };
    }

    if (type === "internal-to-approve") {
      return {
        params: currentParams,
        url: ApiRoutes.GET_INTERNAL_TO_APPROVE,
      };
    }

    // По умолчанию для этого ворпера используем GET_CORRESPONDENCES (например для внешних если они сюда попадут)
    return {
      params: currentParams,
      url: ApiRoutes.GET_CORRESPONDENCES,
    };
  }, [baseParams, folder_id, type]);

  return (
    <>
      <NewRegistry
        type={type}
        createButtonText={createButtonText}
        extraParams={params}
        url={url}
      />
    </>
  );
};
