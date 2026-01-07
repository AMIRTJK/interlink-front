import { Button } from "antd";

interface IProps {
    resolutionerName: string;
    setIsLetterExecutionVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RenderField:React.FC<IProps> = ({ resolutionerName, setIsLetterExecutionVisible }) => {
    return (
        <div className="bg-white p-8 rounded-2xl min-w-[1360px] max-w-[1361px]">
            <h3 className="mb-2">{resolutionerName || "Резолюционер"}</h3>
            <div className="flex gap-2">
                <Button onClick={() => setIsLetterExecutionVisible(true)}>
                    Исполнения
                </Button>
                <Button>
                    Подготовить ответ
                </Button>
            </div>
        </div>
    );
};
