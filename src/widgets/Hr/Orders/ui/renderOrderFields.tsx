import React from 'react';
import { Plus, X, UploadCloud, FileText, UserCircle2, ShieldCheck } from 'lucide-react';
import { ORDER_TYPES } from '../model';

export const renderOrderFields = ({
  state,
  methods,
  orgs = [],
  users = [],
}: {
  state: any;
  methods: any;
  orgs: any[];
  users: any[];
}) => {
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/10 focus:border-[#1E3A5F] focus:bg-white text-gray-800 transition-all";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";
  const sectionTitle = (num: number, title: string) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xs font-bold shrink-0">{num}</div>
      <div className="w-0.5 h-4 bg-slate-200" />
      <span className="font-bold text-[#1E3A5F] text-[13px] tracking-wide uppercase">{title}</span>
    </div>
  );

  const filteredEmployees = state.organizationId
    ? users.filter((u) => u.orgId === state.organizationId)
    : users;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. РЕКВИЗИТЫ ПРИКАЗА */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        {sectionTitle(1, 'РЕКВИЗИТЫ ПРИКАЗА')}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className={labelCls}>ОРГАНИЗАЦИЯ *</label>
            <select
              value={state.organizationId || ''}
              onChange={(e) => {
                state.setOrganizationId(Number(e.target.value));
                state.setEmployeeId(null);
              }}
              className={inputCls}
            >
              <option value="" disabled>Выберите организацию</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>ТИП ПРИКАЗА *</label>
            <select
              value={state.orderType}
              onChange={(e) => state.setOrderType(e.target.value)}
              className={inputCls}
            >
              <option value="" disabled>Выберите тип приказа</option>
              {ORDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>НОМЕР ПРИКАЗА *</label>
            <input
              type="text"
              value={state.orderNum}
              onChange={(e) => state.setOrderNum(e.target.value)}
              placeholder="ПР-2026-001"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>ДАТА ПРИКАЗА *</label>
            <input
              type="date"
              value={state.orderDate}
              onChange={(e) => state.setOrderDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>СОТРУДНИК (КОГО КАСАЕТСЯ) *</label>
          <select
            value={state.employeeId || ''}
            onChange={(e) => state.setEmployeeId(Number(e.target.value))}
            className={inputCls}
            disabled={!state.organizationId}
          >
            <option value="" disabled>
              {state.organizationId ? 'Выберите сотрудника' : 'Сначала выберите организацию'}
            </option>
            {filteredEmployees.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 2. ПРИКАЗ (A4 Document) */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          {sectionTitle(2, 'ПРИКАЗ')}
          
          <div className="flex-1 border border-slate-100 shadow-inner rounded-xl bg-white p-8 max-w-[794px] w-full self-center">
            {/* Header */}
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

            {/* Number & Date inline */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-6">
              <div className="flex items-center gap-2 text-[13px] text-gray-700">
                <span>от</span>
                <input
                  type="date"
                  value={state.orderDate}
                  onChange={(e) => state.setOrderDate(e.target.value)}
                  className="border-0 border-b border-gray-400 bg-transparent outline-none text-[13px] w-36 text-center cursor-pointer"
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

            {/* Body text */}
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

            {/* Points */}
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

            {/* Signature */}
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

        {/* 3 & 4. ИСПОЛНИТЕЛЬ & ПРИЛОЖЕНИЕ (Sidebar) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            {sectionTitle(3, 'ИСПОЛНИТЕЛЬ')}
            <div className="space-y-5">
              <div>
                <label className={labelCls}>ВЫБРАТЬ ИСПОЛНИТЕЛЯ *</label>
                <select
                  value={state.executorId || ''}
                  onChange={(e) => state.setExecutorId(Number(e.target.value))}
                  className={inputCls}
                >
                  <option value="" disabled>Выберите исполнителя</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
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
              {sectionTitle(4, 'ЗАГРУЗИТЬ ПРИЛОЖЕНИЕ')}
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
      </div>
    </div>
  );
};
