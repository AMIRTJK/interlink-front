export interface IDepartment {
    id: number;
    name: string;
    description?: string;
}

export interface IRole {
    id: number;
    name: string;
    description?: string;
}

export interface IOrganization {
    id: number;
    name: string;
    short_name: string;
}

export interface IUser {
    id: number;
    full_name: string;
    position?: string;
    department?: IDepartment;
    departments?: IDepartment[];
    roles?: IRole[];
    organization?: IOrganization;
    photo_path?: string;
}

export interface ISelectExecutorsModalProps {
    open: boolean;
    onCancel: () => void;
    onOk: (departments: IDepartment[], users: IUser[], mainUserId?: number, mainDeptId?: number) => void;
    initialSelectedDepartments?: IDepartment[];
    initialSelectedUsers?: IUser[];
    initialMainUserId?: number;
    initialMainDeptId?: number;
}
