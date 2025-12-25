import { Button } from "antd";

interface IRenderField {
    resolutionerName: string;
}

export const RenderField = ({ resolutionerName }: IRenderField) => {
    return (
        <div>
            <h3 className="mb-2">{resolutionerName || "Резолюционер"}</h3>
            <div className="flex gap-2">
                <Button>
                    Исполнения
                </Button>
                <Button>
                    Подготовить ответ
                </Button>
            </div>
        </div>
    );
};
