import { INameId } from "@shared/types/global";

export const transformResponse = (response: any) => {
  let options: { value: string | number; label: string }[] = [];

  if (response?.data?.system && Array.isArray(response.data.system)) {
    const systemOptions = response.data.system.map((sysName: string) => ({
      value: sysName,
      label: sysName.charAt(0).toUpperCase() + sysName.slice(1),
    }));
    options = [...options, ...systemOptions];
  }

  if (response?.data?.custom_tree && Array.isArray(response.data.custom_tree)) {
    const customOptions = response.data.custom_tree.map((item: INameId) => ({
      value: item.id,
      label: item.name,
    }));
    options = [...options, ...customOptions];
  }

  return options;
};
