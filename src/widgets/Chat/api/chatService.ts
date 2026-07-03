import type { Contact, Message } from "../model/types";
import { mockContacts, mockContactMessages } from "../model/mockData";

// ─── Сервисный слой чата ──────────────────────────────────────────────────────
// ЕДИНСТВЕННАЯ точка интеграции с backend. Сейчас все методы возвращают mock-данные
// (../model/mockData). Когда появится реальный API, достаточно заменить тела методов
// на запросы (например, через _axios из @shared/api) — UI-компоненты менять НЕ нужно,
// т.к. они зависят только от этого интерфейса и доменных типов.

// Небольшая эмуляция сетевой задержки, чтобы UI был готов к асинхронности.
const NETWORK_DELAY = 150;
const delay = (ms = NETWORK_DELAY) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Возвращаем копии, чтобы UI не мутировал mock-массивы напрямую
// (реальный API так же будет отдавать новые объекты на каждый запрос).
const clone = <T,>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

export const chatService = {
  /** Список диалогов/контактов. Заменить на GET /chats. */
  async getContacts(): Promise<Contact[]> {
    await delay();
    return clone(mockContacts);
  },

  /** Все сообщения, сгруппированные по контакту. Заменить на GET /chats/messages. */
  async getAllMessages(): Promise<Record<string, Message[]>> {
    await delay();
    return clone(mockContactMessages);
  },

  /** Сообщения конкретного диалога. Заменить на GET /chats/:contactId/messages. */
  async getMessages(contactId: string): Promise<Message[]> {
    await delay();
    return clone(mockContactMessages[contactId] ?? []);
  },

  /** Отправка сообщения. Заменить на POST /chats/:contactId/messages. */
  async sendMessage(contactId: string, message: Message): Promise<Message> {
    await delay(0);
    // В mock-режиме просто подтверждаем отправку, возвращая сообщение.
    // Реальный сервер вернёт сохранённое сообщение (с id/временем от бэкенда).
    void contactId;
    return clone(message);
  },
};

export type ChatService = typeof chatService;
