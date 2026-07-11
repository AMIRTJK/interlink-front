/**
 * Движение письма («Структура») — реконструкция хронологической цепочки событий
 * документа из данных, которые УЖЕ приходят в списочных ответах реестра
 * (creator, approvals[], signatures[], recipients[], sent_at, created_at).
 *
 * ВАЖНО: это единственное место, где «сырые» поля письма превращаются в
 * нормализованный массив событий `MovementEvent[]`. Когда бэкенд отдаст готовую
 * цепочку/аудит-лог отдельным эндпоинтом, достаточно заменить реализацию
 * `buildLetterMovement` — UI (StructureView) менять не потребуется.
 *
 * Чего сейчас НЕ хватает в API (собрано для задачи бэкенду):
 *  - авторский текст события/заметки на каждый переход: реально есть только
 *    `approvals[].note`; у подписей и системных переходов заметок нет — поэтому
 *    подписи текста нет (title формируется на фронте по типу события);
 *  - `position` / `photo_path` у участников (creator/approver/signer/recipient):
 *    аватар строится по инициалам;
 *  - единый нормализованный timeline-эндпоинт (пока собираем из сущностей).
 */

export type MovementKind =
  | "created"
  | "to_approve"
  | "approved"
  | "rejected"
  | "pending_approve"
  | "to_sign"
  | "signed"
  | "pending_sign"
  | "sent"
  | "read";

export interface MovementActor {
  id: number | string | null;
  fullName: string;
  initials: string;
  /** Системный актор («Система») — для авто-переходов между этапами. */
  isSystem?: boolean;
}

export interface MovementEvent {
  /** Стабильный ключ для React. */
  id: string;
  kind: MovementKind;
  actor: MovementActor;
  /** Человекочитаемое описание события. */
  title: string;
  /** Текст статус-бейджа рядом с актором. */
  statusLabel: string;
  /** ISO-таймстемп события (может отсутствовать). */
  at: string | null;
  /** Заметка к событию. Реально приходит только из approvals[].note. */
  note?: string | null;
}

export type LetterDirection = "incoming" | "outgoing";

const SYSTEM_ACTOR: MovementActor = {
  id: null,
  fullName: "Система",
  initials: "С",
  isSystem: true,
};

/** Инициалы из ФИО (2 буквы). Пустые/точечные значения даём как «—». */
export const getInitials = (fullName?: string | null): string => {
  if (!fullName) return "—";
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => p && p !== ".");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "—";
};

const toActor = (user: any): MovementActor => ({
  id: user?.id ?? null,
  fullName: user?.full_name || "Пользователь",
  initials: getInitials(user?.full_name),
});

const minByCreatedAt = <T extends { created_at?: string | null }>(
  items: T[],
): T | undefined =>
  items.reduce<T | undefined>((min, cur) => {
    if (!min) return cur;
    const a = cur.created_at ? new Date(cur.created_at).getTime() : Infinity;
    const b = min.created_at ? new Date(min.created_at).getTime() : Infinity;
    return a < b ? cur : min;
  }, undefined);

/**
 * Собирает нормализованную цепочку движения письма из полей элемента реестра.
 * Все данные реальные; текст описаний формируется по типу события.
 */
export const buildLetterMovement = (
  item: any,
  direction: LetterDirection = "outgoing",
): MovementEvent[] => {
  if (!item) return [];

  const events: MovementEvent[] = [];
  const approvals: any[] = Array.isArray(item.approvals) ? item.approvals : [];
  const signatures: any[] = Array.isArray(item.signatures)
    ? item.signatures
    : [];
  const recipients: any[] = Array.isArray(item.recipients)
    ? item.recipients
    : [];

  // Инициатор служебных переходов (передан на согласование/подпись, отправлен).
  // Отдельного «кто передал/отправил» в API нет, но эти действия выполняет
  // владелец документа — показываем его вместо обезличенной «Системы».
  // SYSTEM_ACTOR остаётся запасным вариантом, если автора нет в данных.
  const initiator: MovementActor = item.creator
    ? toActor(item.creator)
    : SYSTEM_ACTOR;

  // 1. Создание документа.
  if (item.created_at) {
    events.push({
      id: `created-${item.id}`,
      kind: "created",
      actor: toActor(item.creator),
      title:
        direction === "outgoing"
          ? "Создан исходящий документ"
          : "Документ зарегистрирован",
      statusLabel: "Создан",
      at: item.created_at,
    });
  }

  // 2. Согласование: вход в этап + решения согласующих.
  if (approvals.length > 0) {
    const firstInvite = minByCreatedAt(approvals);
    events.push({
      id: `to-approve-${item.id}`,
      kind: "to_approve",
      actor: initiator,
      title: "Передан на согласование",
      statusLabel: "На согласование",
      at: firstInvite?.created_at ?? null,
    });

    approvals.forEach((a) => {
      const actor = toActor(a.approver || a.user);
      if (a.status === "approved" || a.status === "rejected") {
        events.push({
          id: `approval-${a.id}`,
          kind: a.status === "approved" ? "approved" : "rejected",
          actor,
          title: a.status === "approved" ? "Согласовано" : "Отклонено",
          statusLabel: a.status === "approved" ? "Согласовано" : "Отклонено",
          at: a.decided_at ?? a.updated_at ?? null,
          note: a.note,
        });
      } else {
        events.push({
          id: `approval-${a.id}`,
          kind: "pending_approve",
          actor,
          title: "Ожидает согласования",
          statusLabel: "Ожидание",
          at: a.created_at ?? null,
          note: a.note,
        });
      }
    });
  }

  // 3. Подпись: вход в этап + подписанты.
  if (signatures.length > 0) {
    const firstSign = minByCreatedAt(signatures);
    events.push({
      id: `to-sign-${item.id}`,
      kind: "to_sign",
      actor: initiator,
      title: "Передан на подпись",
      statusLabel: "На подпись",
      at: firstSign?.created_at ?? null,
    });

    signatures.forEach((s) => {
      const actor = toActor(s.user);
      if (s.status === "signed" && s.signed_at) {
        events.push({
          id: `signature-${s.id}`,
          kind: "signed",
          actor,
          title: "Документ подписан",
          statusLabel: "Подписан",
          at: s.signed_at,
        });
      } else {
        events.push({
          id: `signature-${s.id}`,
          kind: "pending_sign",
          actor,
          title: "Ожидает подписи",
          statusLabel: "На подписи",
          at: s.created_at ?? null,
        });
      }
    });
  }

  // 4. Отправка адресату.
  if (item.sent_at) {
    events.push({
      id: `sent-${item.id}`,
      kind: "sent",
      actor: initiator,
      title: "Документ отправлен адресату",
      statusLabel: "Отправлен",
      at: item.sent_at,
    });
  }

  // 5. Прочтение получателями (когда read_at заполнён).
  recipients.forEach((r) => {
    if (r.read_at) {
      events.push({
        id: `read-${r.id}`,
        kind: "read",
        actor: toActor(r.user),
        title: "Прочитано получателем",
        statusLabel: "Прочитано",
        at: r.read_at,
      });
    }
  });

  return events.sort((a, b) => {
    const ta = a.at ? new Date(a.at).getTime() : Infinity;
    const tb = b.at ? new Date(b.at).getTime() : Infinity;
    return ta - tb;
  });
};

// ─── Группировка писем по датам (Сегодня / Вчера / …) ──────────────────────

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Метка группы по дате письма. */
export const getDateGroupLabel = (iso?: string | null): string => {
  if (!iso) return "Без даты";
  const today = startOfDay(new Date());
  const day = startOfDay(new Date(iso));
  const diffDays = Math.round((today - day) / 86_400_000);
  if (diffDays <= 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays <= 7) return "На этой неделе";
  if (diffDays <= 31) return "В этом месяце";
  return "Ранее";
};

export interface LetterGroup {
  label: string;
  items: any[];
}

/** Группирует письма по дате (created_at → doc_date → sent_at), сохраняя порядок. */
export const groupLettersByDate = (documents: any[]): LetterGroup[] => {
  const groups: LetterGroup[] = [];
  const index = new Map<string, LetterGroup>();

  (documents || []).forEach((doc) => {
    const label = getDateGroupLabel(
      doc?.created_at || doc?.doc_date || doc?.sent_at,
    );
    let group = index.get(label);
    if (!group) {
      group = { label, items: [] };
      index.set(label, group);
      groups.push(group);
    }
    group.items.push(doc);
  });

  return groups;
};

/** Склонение слова «документ». */
export const pluralizeDocuments = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "документ";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "документа";
  return "документов";
};
