import { ApartmentOutlined, CheckCircleFilled } from '@ant-design/icons';
import { IDepartment } from '../model';

interface DeptListItemProps {
    dept: IDepartment;
    isSelected: boolean;
    onToggle: (dept: IDepartment) => void;
}

export const DeptListItem: React.FC<DeptListItemProps> = ({ dept, isSelected, onToggle }) => {
    return (
        <div 
            className={`dept__item ${isSelected ? 'dept__item--selected' : ''}`} 
            onClick={() => onToggle(dept)}
        >
            <div className={`dept__icon ${isSelected ? "dept__icon--selected" : ""}`}>
                <ApartmentOutlined />
            </div>
            <span className="dept__name">{dept.name}</span>
            {isSelected && <CheckCircleFilled style={{ color: '#1890ff' }} />}
        </div>
    );
};
