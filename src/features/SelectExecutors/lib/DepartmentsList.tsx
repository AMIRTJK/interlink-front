import React from 'react';
import { Empty, Spin } from "antd";
import { IDepartment } from "../model/types";
import { DeptListItem } from "./DeptListItem";

interface DepartmentsListProps {
    loading: boolean;
    departments: IDepartment[];
    selectedDepartments: IDepartment[];
    onToggle: (dept: IDepartment) => void;
    pagination?: { current_page: number; last_page: number };
    onPageChange?: (page: number) => void;
}

export const DepartmentsList: React.FC<DepartmentsListProps> = ({ loading, departments, selectedDepartments, onToggle, pagination, onPageChange }) => {
    if (loading) return <div className="text-center py-10"><Spin /></div>;

    if (departments.length === 0) {
        return <Empty description={<span style={{color: '#666'}}>Отделы не найдены</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <div className="departments-list-container">
          <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 4, marginBottom: 16 }}>
            {departments.map((dept) => (
                <DeptListItem 
                    key={dept.id} 
                    dept={dept}
                    isSelected={!!selectedDepartments.find(d => d.id === dept.id)}
                    onToggle={onToggle}
                />
            ))}
          </div>
          
          {pagination && (
                <div className="flex justify-center items-center gap-4 py-2">
                    <button 
                        className={`px-3 py-1 rounded border ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        onClick={() => onPageChange?.(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                    >
                        Назад
                    </button>
                    <span className="text-sm">
                        Страница {pagination.current_page} из {pagination.last_page}
                    </span>
                    <button 
                        className={`px-3 py-1 rounded border ${pagination.current_page === pagination.last_page ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        onClick={() => onPageChange?.(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                    >
                        Вперед
                    </button>
                </div>
            )}
      </div>
    );
};
