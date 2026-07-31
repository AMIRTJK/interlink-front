import { Plus, X, UserCircle2, ShieldCheck } from 'lucide-react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { SectionTitle, inputCls } from './orderFieldsModel';

interface IProps {
  state: any;
  methods: any;
}

export const OrderDocumentCard = ({ state, methods }: IProps) => (
  <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
    <SectionTitle num={2} title="ПРИКАЗ" />

    <div className="flex-1 border border-slate-100 shadow-inner rounded-xl bg-white p-8 max-w-[794px] w-full self-center">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-700 font-bold text-xl select-none">
            ТЖ
          </div>
        </div>
        <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">
          МИНИСТЕРСТВО ФИНАНСОВ РЕСПУБЛИКИ ТАДЖИКИСТАН
        </p>
        <div className="border-t border-gray-300 my-4" />
        <p className="text-[20px] font-bold text-gray-900 tracking-[0.2em] mb-1">П Р И К А З</p>
      </div>

      <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-6">
        <div className="flex items-center gap-2 text-[13px] text-gray-700">
          <span>от</span>
          <DatePicker
            value={state.orderDate ? dayjs(state.orderDate) : null}
            onChange={(_date, dateString) => state.setOrderDate(dateString as string)}
            format="DD.MM.YYYY"
            variant="borderless"
            style={{ width: 140, fontSize: 13 }}
            className="text-center!"
          />
        </div>
        <div className="flex items-center gap-2 text-[13px] text-gray-700">
          <span>№</span>
          <input
            type="text"
            value={state.orderNum}
            onChange={(e) => state.setOrderNum(e.target.value)}
            placeholder="№ _______"
            className="border-0 border-b border-gray-400 bg-transparent outline-none text-[13px] w-32 text-center"
          />
        </div>
      </div>

      <div className="mb-6">
        <textarea
          value={state.additionalBasis}
          onChange={(e) => {
            state.setAdditionalBasis(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          placeholder="На основании заявления кандидата..."
          className="w-full text-[12px] text-gray-700 leading-relaxed bg-transparent border-0 outline-none focus:bg-slate-50 rounded p-2 resize-none min-h-[80px]"
          rows={4}
        />
      </div>

      <div className="space-y-3 mb-6">
        {state.orderPoints.map((point: any, idx: number) => (
          <div key={point.id} className={`flex items-start gap-2 transition-all ${point.removing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <span className="text-sm font-semibold text-gray-400 mt-2.5 w-6 text-right shrink-0">{idx + 1}.</span>
            <input
              type="text"
              value={point.value}
              onChange={(e) => methods.updatePoint(point.id, e.target.value)}
              placeholder="Принять сотрудника на должность..."
              className={inputCls}
            />
            {state.orderPoints.length > 1 && (
              <button onClick={() => methods.removePoint(point.id)} className="p-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0 mt-0.5">
                <X size={15} />
              </button>
            )}
          </div>
        ))}
        <button onClick={methods.addPoint} className="w-full py-2.5 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-[#1E3A5F] hover:border-[#1E3A5F] transition-all text-sm font-medium mt-2">
          <Plus size={16} />
          <span>Добавить пункт</span>
        </button>
      </div>

      <div className="flex items-end justify-between pt-6 border-t border-slate-100">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-gray-700">Министр финансов</span>
          <button
            onClick={() => state.setMinisterSigned(true)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold text-white transition-all ${state.ministerSigned ? 'bg-emerald-500 shadow-emerald-500/20 shadow-md' : 'bg-[#1E3A5F] hover:bg-[#1E3A5F]/90'}`}
          >
            {state.ministerSigned && <ShieldCheck size={14} />}
            <span>Подписать ЭЦП</span>
          </button>
        </div>
        <div className="flex items-center gap-2 w-48">
          <UserCircle2 size={16} className="text-gray-400 shrink-0" />
          <input type="text" value={state.ministerName} onChange={(e) => state.setMinisterName(e.target.value)} className={inputCls} />
        </div>
      </div>
    </div>
  </div>
);
