import { Avatar } from "antd";
import { 
    SyncOutlined, 
    FileTextOutlined, 
    MessageOutlined,
    ClockCircleOutlined 
} from "@ant-design/icons";
import { IExecutor } from "../model";
import userAvatar from '../../../assets/images/user-avatar.jpg'

// Свойства карточки исполнителя
interface IProps {
    executor: IExecutor; // Данные исполнителя
}

// Карточка одного исполнителя для страницы исполнения
export const ExecutorCard: React.FC<IProps> = ({ executor }) => {
    
    // Определяем цвет плашки в зависимости от статуса
    const getStatusBadgeClass = (status: string) => {
        if (status === 'DONE') return 'resolution-execution__status-badge--green';
        if (status === 'PREPARING') return 'resolution-execution__status-badge--orange';
        return 'resolution-execution__status-badge--gray';
    };

    return (
        <div className="resolution-execution__executor-card">
            
            {/* Шапка: Аватар и Имя */}
            <div className="executor-card__header">
                <Avatar src={userAvatar} size={64} className="executor-card__avatar" />
                <div>
                    <h4 className="executor-card__name">{executor.user.full_name}</h4>
                    <p className="executor-card__role">{executor.role}</p>
                </div>
            </div>

            {/* Плашка текущего статуса */}
            <div className={`resolution-execution__status-badge ${getStatusBadgeClass(executor.status)}`}>
                {executor.statusText}
            </div>

            {/* Список возможных действий */}
            <div className="resolution-execution__actions-list">
                
                {/* Текущий этап работы */}
                <div className="resolution-execution__action-item">
                    <SyncOutlined /> 
                    <span>Исполнение</span>
                </div>
                
                {/* Этап визирования */}
                <div className="resolution-execution__action-item">
                    <ClockCircleOutlined /> 
                    <span>Виза</span>
                </div>

                {/* Быстрые ссылки: заключение и чат */}
                <div className="resolution-execution__action-row mt-2">
                    <div className="resolution-execution__action-link">
                        <FileTextOutlined />
                        <span>Создать заключение</span>
                    </div>
                    <div className="resolution-execution__action-link">
                        <MessageOutlined />
                        <span>Сообщение</span>
                    </div>
                </div>

                {/* История действий */}
                <div className="resolution-execution__action-item mt-2">
                    <ClockCircleOutlined />
                    <span>Действие</span>
                </div>
            </div>
        </div>
    );
};
