export const transformOrgs = (res: unknown) => {
  const data = (res as { data: { data: { id: number; name: string }[] } })?.data?.data || [];
  return data.map((o) => ({ value: String(o.id), label: o.name }));
};

export const transformDeps = (res: unknown) => {
  const data = (res as { data: { data: { id: number; name: string }[] } })?.data?.data || [];
  return data.map((d) => ({ value: String(d.id), label: d.name }));
};

export const transformRoles = (res: unknown) => {
  const raw = (res as { data: { data: { id: number; name: string }[] } | { id: number; name: string }[] })?.data;
  const items = (Array.isArray(raw) ? raw : (raw as { data: { id: number; name: string }[] })?.data) || [];
  return items.map((r) => ({ value: r.name, label: r.name }));
};

export const onlyDigits9 = (v: string) => (v || "").replace(/\D/g, "").slice(0, 9);

export const STATUS_OPTIONS = [
  { value: "active", label: "Активен" },
  { value: "vacation", label: "В отпуске" },
  { value: "business_trip", label: "В командировке" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
];
