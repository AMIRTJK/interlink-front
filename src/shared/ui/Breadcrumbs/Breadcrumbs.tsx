import React from 'react';
import './Breadcrumbs.css';

/**
 * Интерфейс для одного элемента крошек
 */
export interface IBreadcrumbItem {
    label: string;          // Текст
    onClick?: () => void;   // Действие при клике
    icon?: React.ReactNode; // Опциональная иконка
    isActive?: boolean;     // Флаг текущего активного шага
}

/**
 * Пропсы компонента
 */
interface IBreadcrumbsProps {
    items: IBreadcrumbItem[];
    separator?: React.ReactNode; // Кастомный разделитель (по дефолту /)
    className?: string;          // Дополнительный класс
    style?: React.CSSProperties; // Встроенные стили
}

/**
 * Универсальный компонент хлебных крошек
 */
export const Breadcrumbs: React.FC<IBreadcrumbsProps> = ({ 
    items, 
    separator = '>', 
    className = '',
    style
}) => {
    return (
        <nav className={`breadcrumbs ${className}`} style={style}>
            <ul className="breadcrumbs__list">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isActive = item.isActive || isLast;

                    return (
                        <li 
                            key={index} 
                            className={`breadcrumbs__item ${isActive ? 'breadcrumbs__item--active' : ''}`}
                        >
                            {/* Текст или ссылка */}
                            <span 
                                className="breadcrumbs__link" 
                                onClick={!isActive ? item.onClick : undefined}
                            >
                                {item.icon && <span className="breadcrumbs__icon">{item.icon}</span>}
                                {item.label}
                            </span>

                            {/* Разделитель (не рисуем после последнего) */}
                            {!isLast && (
                                <span className="breadcrumbs__separator">
                                    {separator}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
