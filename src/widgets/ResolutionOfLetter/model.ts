import { IUser } from "@features/SelectExecutors";

// Статусы исполнения резолюции
export type ResolutionStatus = 'PREPARING' | 'DONE' | 'PENDING' | 'REJECTED';

// Тип для исполнителя в списке
export interface IExecutor {
    id: number;
    user: IUser;
    role: string; // Номер исполнителя или роль
    status: ResolutionStatus;
    statusText: string; // Текст статуса
    isMain?: boolean; // Главный исполнитель или нет
}

// Тип для уже готового заключения
export interface IConclusion {
    id: number;
    author: IUser;
    date: string; // Дата вынесения
    status: 'DONE' | 'REJECTED'; 
}

// Общая структура резолюции для режима просмотра
export interface IResolution {
    id: number;
    author: IUser;
    createDate: string;
    description: string; // "Для ознакомления..."
    mainExecutor: IUser;
    approvers: IUser[]; // Согласующие
    executors: IExecutor[];
    conclusions: IConclusion[];
    files: any[]; // Файлы вложений
    status: string; // Общий статус резолюции
}
