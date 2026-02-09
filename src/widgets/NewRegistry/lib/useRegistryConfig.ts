import { useIncomingConfig } from "./incoming-config";
import { useOutgoingConfig } from "./outgoing-config";
import { RegistryConfig } from "./types";

export const useRegistryConfig = (type: string): RegistryConfig => {
  const incomingConfig = useIncomingConfig(type);
  const outgoingConfig = useOutgoingConfig(type);

  switch (type) {
    // Входящие
    case "external-incoming":
    case "internal-incoming":
    case "archived":
    case "pinned":
    case "trashed":
    case "internal-archived":
    case "internal-pinned":
      return incomingConfig;

    // Исходящие / Проекты
    case "external-outgoing":
    case "internal-outgoing":
    case "internal-drafts":
    case "internal-to-sign":
    case "internal-to-approve":
    case "internal-trashed":
      return outgoingConfig;

    default:
      return incomingConfig;
  }
};
