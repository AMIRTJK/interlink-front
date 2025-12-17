// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformAssigneesResponse = (data:any) => {
  const items = Array.isArray(data?.data) ? data.data : [];

  return items.map(
    (user: {
      id: number;
      full_name: string;
      position: string;
      photo_path: string | null;
      organization: string;
    }) => ({
      value: user.id,
      label: user.full_name,
    })
  );
};
