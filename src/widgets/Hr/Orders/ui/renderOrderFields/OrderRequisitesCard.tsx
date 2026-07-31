import { Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { ORDER_TYPES } from '../../model';
import { SectionTitle, inputCls, labelCls, selectStyle } from './orderFieldsModel';

interface IProps {
  state: any;
  orgs: any[];
  users: any[];
}

export const OrderRequisitesCard = ({ state, orgs, users }: IProps) => {
  const filteredEmployees = state.organizationId
    ? users.filter((u) => u.orgId === state.organizationId)
    : users;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <SectionTitle num={1} title="РЕКВИЗИТЫ ПРИКАЗА" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <label className={labelCls}>ОРГАНИЗАЦИЯ *</label>
          <Select
            value={state.organizationId || undefined}
            onChange={(val) => {
              state.setOrganizationId(val);
              state.setEmployeeId(null);
            }}
            placeholder="Выберите организацию"
            style={selectStyle}
            options={orgs.map((o) => ({ value: o.id, label: o.name }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
        <div>
          <label className={labelCls}>ТИП ПРИКАЗА *</label>
          <Select
            value={state.orderType || undefined}
            onChange={(val) => state.setOrderType(val)}
            placeholder="Выберите тип приказа"
            style={selectStyle}
            options={ORDER_TYPES.map((t) => ({ value: t, label: t }))}
          />
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
          <DatePicker
            value={state.orderDate ? dayjs(state.orderDate) : null}
            onChange={(_date, dateString) => state.setOrderDate(dateString as string)}
            format="DD.MM.YYYY"
            placeholder="Выберите дату"
            style={selectStyle}
            className="w-full!"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className={labelCls}>СОТРУДНИК (КОГО КАСАЕТСЯ) *</label>
        <Select
          value={state.employeeId || undefined}
          onChange={(val) => state.setEmployeeId(val)}
          placeholder={state.organizationId ? 'Выберите сотрудника' : 'Сначала выберите организацию'}
          disabled={!state.organizationId}
          style={selectStyle}
          options={filteredEmployees.map((u) => ({ value: u.id, label: u.name }))}
          showSearch
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
    </div>
  );
};
