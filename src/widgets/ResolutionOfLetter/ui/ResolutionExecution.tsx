import { useParams } from "react-router-dom";
import { IResolution } from "../model";
import { ResolutionExecutionLayout } from "./ResolutionExecutionLayout";

// Свойства страницы исполнения
interface IProps {
    resolution?: IResolution; // Опциональный объект резолюции
}

// Страница просмотра хода исполнения резолюции
export const ResolutionExecution: React.FC<IProps> = ({ resolution: propResolution }) => {
    // Получаем ID из URL для запроса данных (в будущем)
    const { id } = useParams<{ id: string }>();

    // Тестовые данные для отладки интерфейса
    const mockResolution: IResolution = {
        id: Number(id) || 1,
        author: { id: 1, full_name: "Иванов Иван Иванович", position: "Директор" },
        createDate: "15.01.2026",
        description: "Для ознакомления и исполнения в установленные сроки.",
        status: "В процессе",
        mainExecutor: { id: 2, full_name: "Петров Петр Петрович", position: "Начальник отдела" },
        approvers: [],
        files: [],
        conclusions: [],
        executors: [
            {
                id: 1,
                user: { id: 2, full_name: "Петров Петр Петрович", position: "Начальник отдела" },
                role: "Исполнитель 1",
                status: "PENDING",
                statusText: "В ожидании",
                isMain: true // Флаг главного исполнителя (подсвечивается оранжевым)
            },
            {
                id: 2,
                user: { id: 3, full_name: "Сидоров Сидор", position: "Специалист" },
                role: "Исполнитель 2",
                status: "PREPARING",
                statusText: "Подготовка"
            }
        ]
    };

    // Приоритет отдаем пропсам, иначе используем моки
    const resolution = propResolution || mockResolution;

    return (
        <div className="resolution-execution-page">
            {/* Рендерим лейаут страницы исполнения */}
            <ResolutionExecutionLayout resolution={resolution} />
        </div>
    );
};
