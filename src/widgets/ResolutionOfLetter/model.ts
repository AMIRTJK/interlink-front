import { IUser } from "@features/SelectExecutors";

// Статусы выполнения
export type ResolutionStatus = 'PREPARING' | 'DONE' | 'PENDING' | 'REJECTED';

// Исполнитель
export interface IExecutor {
    id: number; // Уникальный ID
    user: IUser; // Данные пользователя
    role: string; // Роль или номер
    status: ResolutionStatus; // Статус задачи
    statusText: string; // Текст для отображения
    isMain?: boolean; // Флаг главного исполнителя
}

// Заключение
export interface IConclusion {
    id: number; // ID заключения
    author: IUser; // Кто написал
    date: string; // Когда написано
    status: 'DONE' | 'REJECTED'; // Результат
}

// Структура вложения (файла)
export interface IAttachment {
    id: number; // ID файла
    name: string; // Название
    url: string; // Ссылка на скачивание
    size?: number; // Размер в байтах
    type?: string; // MIME-тип
}

// Резолюция (просмотр)
export interface IResolution {
    id: number; // Уникальный ID
    author: IUser; // Кто выдал (Объект пользователя)
    createDate: string; // Дата создания
    description: string; // Текст основания ("Для ознакомления...")
    mainExecutor: IUser; // Главный исполнитель
    approvers: IUser[]; // Визирующие
    executors: IExecutor[]; // Список всех исполнителей
    conclusions: IConclusion[]; // Заключения по резолюции
    files: IAttachment[]; // Прикрепленные файлы
    status: string; // Общий статус резолюции
}
