import { CreateDepartment } from "./ui/CreateDepartament";
import { CreateOrganization } from "./ui/CreateOrganization";
import { CreatePermissionAndRole } from "./ui/CreatePermissionAndRole";
import { CreateUser } from "./ui/CreateUser";
import { SetUserRole } from "./ui/SetRoles";
export const Hr: React.FC = () => {
    return (
        <div>
            <h1>HR</h1>
            <CreateOrganization/>
            <CreateUser/>
            <SetUserRole/>
            <CreatePermissionAndRole/>
            <CreateDepartment/>
        </div>
    );
};