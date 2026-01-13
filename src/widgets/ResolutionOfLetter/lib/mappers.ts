import { IResolution } from "../model";
import { IUser } from "@features/SelectExecutors";

/**
 * Преобразуем данные из формы и стейта в структуру резолюции.
 * Это нужно для того, чтобы показать пользователю, как будет выглядеть
 * финальный документ, еще до того, как он реально сохранится в БД.
 */
export const mapStateToResolution = (
    currentUser: IUser | null,
    selectedUsers: IUser[],
    visaValue: string | undefined,
    uploadedFiles: any[]
): IResolution => {
    
    // Если по какой-то причине текущий юзер не нашелся (например, баг с токеном),
    // подстрахуемся пустым объектом, чтобы фронт не упал.
    // Но по-хорошему тут всегда должен быть юзер.
    const authorStub = {
        id: 0,
        full_name: 'Неизвестный пользователь',
        position: 'Сотрудник',
        last_name: '', first_name: '', middle_name: '', phone: '', 
        photo_path: undefined, phone_verified_at: undefined, meta: undefined, 
        created_at: '', updated_at: '', roles: [], permissions: []
    } as IUser;

    const safeAuthor = currentUser ?? authorStub;

    // Первого выбранного считаем главным, остальных — просто исполнителями.
    // Если никого не выбрали (хотя валидация не должна пустить), ставим заглушку.
    const mainExecutor = selectedUsers[0] ?? ({ 
        id: 0, 
        full_name: 'Не назначен', 
        position: '' 
    } as IUser);

    return {
        id: Date.now(), // Генерим временный ID чисто для ключей React, на бэке будет нормальный
        author: safeAuthor,
        createDate: new Date().toLocaleDateString(), // Текущая дата
        description: visaValue || 'Для ознакомления и вынесения заключения',
        mainExecutor: mainExecutor,
        approvers: [], // Согласующих пока в этой форме нет, но в будущем можем прокинуть сюда
        executors: selectedUsers.map((user, index) => ({
            id: user.id,
            user: user,
            // Просто нумеруем роли, чтобы выглядело структурировано
            role: `Исполнитель №${index + 1}`,
            status: 'PREPARING',
            statusText: 'Подготовка заключения',
            isMain: index === 0
        })),
        conclusions: [
            // Добавляем пример заключения, чтобы мы видели, как выглядит карточка.
            // В проде при создании их нет, но для демо оставим.
            {
                id: 999,
                author: safeAuthor, // Автор заключения - текущий юзер
                date: new Date().toLocaleDateString() + ', ' + new Date().toLocaleTimeString().slice(0, 5),
                status: 'DONE'
            }
        ],
        files: uploadedFiles,
        status: 'Подготовка заключения'
    };
};
