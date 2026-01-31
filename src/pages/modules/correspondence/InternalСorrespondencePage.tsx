import { InternalCorrespondece } from "@widgets/InternalCorrespondece/ui";

export const InternalСorrespondencePage = () => {
    return <div className="flex gap-3"><h3>Внутренняя корреспонденция</h3>
        <h3>Header Internal-actions</h3>
        {/* Гл компонент */}
        {/* mode="create" | "show" */}
        <InternalCorrespondece mode="create" />
    </div>;
};