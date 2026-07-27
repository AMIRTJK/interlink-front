// Визирующие входящего письма. Бэкенд отдаёт списки как в «плоском» виде
// (массив пользователей), так и в пагинированном (data/items) — приводим к
// одному типу, чтобы UI не зависел от формы ответа.

export interface IVisorUser {
  id: number;
  full_name: string;
  position?: string;
  phone?: string;
  invited_at?: string;
}

export const VISOR_INVITE_HINT =
  "Поручение доступно после приглашения визирующего";

export const extractVisorList = (raw: unknown): Record<string, any>[] => {
  const payload = (raw as { data?: any })?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.visors)) return payload.visors;
  return [];
};

export const normalizeVisor = (raw: Record<string, any>): IVisorUser => {
  const user = raw?.user || raw?.visor || raw?.invited_user || raw;
  const fullName =
    user?.full_name ||
    [user?.last_name, user?.first_name].filter(Boolean).join(" ") ||
    "Без имени";

  return {
    id: Number(user?.id ?? raw?.user_id ?? 0),
    full_name: fullName,
    position: user?.position || undefined,
    phone: user?.phone || undefined,
    invited_at: raw?.invited_at || raw?.created_at || undefined,
  };
};

export const normalizeVisors = (raw: unknown): IVisorUser[] =>
  extractVisorList(raw)
    .map(normalizeVisor)
    .filter((visor) => visor.id > 0);

export const getVisorInitials = (fullName?: string) => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  return (
    parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2)
  ).toUpperCase();
};

export const formatVisorDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
