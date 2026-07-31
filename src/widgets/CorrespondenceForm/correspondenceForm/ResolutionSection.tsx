import { Button as AntButton, Table, Avatar } from "antd";
import {
  FilePdfOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { HISTORY_COLUMNS, HISTORY_DATA } from "./correspondenceFormModel";

interface IProps {
  onExecute: () => void;
}

/** Блок «Резолюция» и таблица истории документа — только для режима просмотра. */
export const ResolutionSection = ({ onExecute }: IProps) => (
  <>
    <div>
      <h2 className="text-lg font-semibold mb-5 text-gray-800 border-b border-gray-100 pb-2">
        Резолюция
      </h2>
      <div className="flex flex-wrap gap-6 items-stretch">
        <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 flex-1 min-w-[300px] bg-white">
          <Avatar
            size={48}
            icon={<UserOutlined />}
            className="bg-blue-100! text-blue-600!"
          />
          <div>
            <div className="font-bold text-base text-gray-900">
              Шарипов Амир
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Старший специалист / Исполнитель №1
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-center gap-3 flex-1 min-w-[300px] cursor-pointer hover:bg-[#F1F5F9] transition-colors py-4 px-6 group">
          <div className="text-[#0037AF] group-hover:scale-110 transition-transform">
            <FilePdfOutlined style={{ fontSize: "28px" }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[#0037AF] font-medium text-sm">
              Название.pdf
            </span>
            <span className="text-xs text-gray-400">
              Нажмите для просмотра
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-55 justify-center">
          <AntButton
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onExecute}
            className="bg-[#0037AF]! hover:bg-[#002D93]! h-10! rounded-lg! font-medium! text-sm! shadow-sm! border-none! w-full!"
          >
            На исполнение
          </AntButton>
          <AntButton className="border-[#0037AF]! text-[#0037AF]! h-10! rounded-lg! font-medium! text-sm! hover:bg-blue-50! w-full!">
            Подготовить ответ
          </AntButton>
        </div>
      </div>
    </div>

    {/* ИСТОРИЯ */}
    <div className="pb-5">
      <h2 className="text-lg font-semibold mb-5 text-gray-800 border-b border-gray-100 pb-2">
        История документа
      </h2>
      <Table
        columns={HISTORY_COLUMNS}
        dataSource={HISTORY_DATA}
        pagination={false}
        rowClassName={() => "text-xs"}
        className="border! border-gray-100! rounded-lg! overflow-hidden! [&_.ant-table-thead_th]:bg-[#F9FAFB]! [&_.ant-table-thead_th]:text-[#6D8AC9]! [&_.ant-table-thead_th]:font-normal!"
      />
    </div>
  </>
);
