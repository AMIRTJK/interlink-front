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
    if (folderId) {
      return {
        ...baseParams,
        folder_id: parseInt(folderId, 10),
      };
    }
    return baseParams;
  }, [baseParams, folderId]);

  return (
    <RegistryTable
      type={type}
      createButtonText={createButtonText}
      extraParams={extraParams}
    />
  );
};
