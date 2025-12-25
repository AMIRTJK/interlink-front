import { Button } from "antd";

interface IRenderField {
    resolutionerName: string;
}

export const RenderField = ({ resolutionerName }: IRenderField) => {
    return (
        <div className="bg-white p-8 rounded-2xl min-w-[1360px] max-w-[1361px]">
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
