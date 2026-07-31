import { Button } from "@shared/ui";
import wordIcon from "../../../../assets/icons/word2.svg";
import executionIcon from "../../../../assets/icons/execution.svg";
import {
  CorrespondenceResponse,
  CorrespondenseStatus,
} from "@entities/correspondence";

interface IProps {
  record: CorrespondenceResponse;
  onNavigateToLetter: (record: CorrespondenceResponse) => void;
  onNavigateToExecution: (fromModal?: boolean) => void;
  onOpenDocument: () => void;
}

export const ExpandedRowDetails = ({
  record,
  onNavigateToLetter,
  onNavigateToExecution,
  onOpenDocument,
}: IProps) => {
  const isExecuteButtonActive =
    CorrespondenseStatus.TO_EXECUTE === record.status;

  return (
    <div className="p-4 bg-[#F2F5FF]">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-[#6D8AC9] mb-0.5 block">
                Отправитель:
              </span>
              <p>{record.sender_name as string}</p>
            </div>

            <div>
              <span className="text-[#6D8AC9] mb-0.5 block">Тема:</span>
              <p>{record.subject as string}</p>
            </div>

            <div>
              <span className="text-[#6D8AC9] mb-0.5 block">Дата:</span>
              <p>{record.created_at as string}</p>
            </div>

            <div>
              <span className="text-[#6D8AC9] mb-0.5 block">
                Входящий номер:
              </span>
              <p>{null}</p>
            </div>

            <div>
              <span className="text-[#6D8AC9] mb-0.5 block">
                Исходящий номер:
              </span>
              <p>{null}</p>
            </div>
            <div>
              <span className="text-[#6D8AC9] mb-0.5 block">Статус:</span>
              <p>{record.status as string}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="default"
            text="Перейти к записи"
            withIcon
            iconAlt="execution"
            className="bg-[#0037AF]! text-white!"
            onClick={() => onNavigateToLetter(record)}
          />
          <Button
            // disabled={!isExecuteButtonActive}
            type="default"
            text="Перейти к исполнению"
            withIcon
            icon={executionIcon}
            iconAlt="execution"
            className={`bg-[#0037AF]! text-white! ${!isExecuteButtonActive ? "opacity-50" : ""}`}
            onClick={() => onNavigateToExecution(false)}
          />
          <Button
            className="border-[#0037AF]! text-[#0037AF]! font-medium!"
            type="default"
            text="Документ"
            withIcon
            icon={wordIcon}
            iconAlt="word"
            onClick={onOpenDocument}
          />
        </div>
      </div>
    </div>
  );
};
