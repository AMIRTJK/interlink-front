import { RegistryTable } from "@widgets/RegistryTable";
import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

interface IncomingTableWrapperProps {
  type: "incoming" | "outgoing";
  createButtonText?: string;
  baseParams: Record<string, unknown>;
}

export const CorrespondenceTableWrapper = ({ 
  type, 
  createButtonText, 
  baseParams 
}: IncomingTableWrapperProps) => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folderId");

  const extraParams = useMemo(() => {
    let params = { ...baseParams };

    // Если в URL есть defaultFolder (папки "Полученные"/"Отправленные"), 
    // добавляем фильтрацию по внутреннему каналу
    const defaultFolder = searchParams.get("defaultFolder");
    if (defaultFolder) {
      params = {
        ...params,
        channel: "internal",
      };
    }

    if (folderId) {
      return {
        ...params,
        folder_id: parseInt(folderId, 10),
      };
    }
    return params;
  }, [baseParams, folderId, searchParams]);

  return (
    <>
      <RegistryTable
        type={type}
        createButtonText={createButtonText}
        extraParams={extraParams}
      />
    </>
  );
};
