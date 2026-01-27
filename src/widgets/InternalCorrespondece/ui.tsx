import { useModalState } from "@shared/lib";
import { ActionToolbar } from "@shared/ui";
import { DrawerActionsModal } from "@widgets/DrawerActionsModal";

export const InternalCorrespondece = () => {
    // Извлекаем правильные имена из хука: open и close
    const { open, close, isOpen } = useModalState();

    return (
        <div className="relative min-h-screen">
            <h1>InternalCorrespondece Widget</h1>
            <DrawerActionsModal open={isOpen} onClose={close} />
            <ActionToolbar 
                setIsInspectorOpen={open} 
                setShowPreview={() => console.log('Просмотр')} 
                handleSend={() => console.log('Отправить')} 
            />
        </div>
    );
};