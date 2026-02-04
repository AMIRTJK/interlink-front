import { ApartmentOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Checkbox } from 'antd';
import { IDepartment } from '../model';

interface DeptListItemProps {
    dept: IDepartment;
    isSelected: boolean;
    isMain: boolean;
    onToggle: (dept: IDepartment) => void;
    onSetMain: (id: number) => void;
}

export const DeptListItem: React.FC<DeptListItemProps> = ({ dept, isSelected, isMain, onToggle, onSetMain }) => {
    return (
        <div 
            className={`dept__item ${isSelected ? 'dept__item--selected' : ''}`} 
            onClick={() => onToggle(dept)}
        >
            <div className={`dept__icon ${isSelected ? "dept__icon--selected" : ""}`}>
                <ApartmentOutlined />
            </div>
            <span className="dept__name">{dept.name}</span>
            <div className="flex items-center gap-4">
                {isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isMain} onChange={() => onSetMain(dept.id)}>
                            Главный
                        </Checkbox>
                    </div>
                )}
                {isSelected && <CheckCircleFilled style={{ color: '#1890ff' }} />}
            </div>
        </div>
    );
};
