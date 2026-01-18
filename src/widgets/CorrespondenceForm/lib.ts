import { INameId } from "@shared/types/global";

export const transformResponse = (response: any) => {
  let items = [];

  if (response?.data?.data && Array.isArray(response.data.data)) {
    items = response.data.data;
  } else if (response?.data && Array.isArray(response.data)) {
    items = response.data;
  } else if (Array.isArray(response)) {
    items = response;
  }

  return items.map((item: INameId) => ({
    value: item.id,
    label: item.name,
  }));
};
