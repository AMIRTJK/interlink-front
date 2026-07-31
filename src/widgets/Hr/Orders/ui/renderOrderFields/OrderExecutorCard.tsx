import { X, UploadCloud, FileText, ShieldCheck } from 'lucide-react';
import { Select } from 'antd';
import { SectionTitle, labelCls, selectStyle } from './orderFieldsModel';

interface IProps {
  state: any;
  methods: any;
  users: any[];
}

export const OrderExecutorCard = ({ state, methods, users }: IProps) => (
  <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <SectionTitle num={3} title="ИСПОЛНИТЕЛЬ" />
      <div className="space-y-5">
        <div>
          <label className={labelCls}>ВЫБРАТЬ ИСПОЛНИТЕЛЯ *</label>
          <Select
            value={state.executorId || undefined}
            onChange={(val) => state.setExecutorId(val)}
            placeholder="Выберите исполнителя"
            style={selectStyle}
            options={users.map((u) => ({ value: u.id, label: u.name }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
        <div>
          <label className={labelCls}>ЭЦП ИСПОЛНИТЕЛЯ</label>
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-2 transition-colors">
            <ShieldCheck size={15} />
            <span>Подписать ЭЦП</span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 mt-6 pt-6">
        <SectionTitle num={4} title="ЗАГРУЗИТЬ ПРИЛОЖЕНИЕ" />
        <input type="file" multiple ref={state.attachInputRef} onChange={methods.handleAttachInputChange} className="hidden" />
        <div onClick={() => state.attachInputRef.current?.click()} className="border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 rounded-xl p-5 text-center cursor-pointer transition-colors group">
          <UploadCloud size={28} className="text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-blue-600 font-medium text-[13px] mb-1">Нажмите для выбора файла</p>
          <p className="text-[10px] text-blue-400/80 uppercase">PDF, DOC, DOCX, JPG, PNG (макс. 10 МБ)</p>
        </div>

        {state.attachments.length === 0 ? (
          <p className="text-[11px] text-slate-400 mt-4 text-center">Нет загруженных файлов</p>
        ) : (
          <div className="space-y-2 mt-4">
            {state.attachments.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} className="text-slate-400 shrink-0" />
                  <span className="text-[12px] text-slate-600 truncate">{file.name}</span>
                </div>
                <button onClick={() => methods.removeAttachment(file.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
