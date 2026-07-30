import React from "react";
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Wallet,
  Calendar,
  ScrollText,
  Hash,
  CreditCard,
  Landmark,
  MapPin,
  User,
  Users,
  Shield,
  FileText,
} from "lucide-react";
import { If } from "@shared/ui";
import { IEmployee, money } from "../model";
import { Field, Section } from "../parts";

interface IProps {
  e: IEmployee;
  formatDate: (s?: string) => string;
  genderLabel: (g?: string) => string;
  passport: string;
  roles: string;
  supervisor: string;
  organization: string;
}

export function EmployeeProfileInfoTab({
  e,
  formatDate,
  genderLabel,
  passport,
  roles,
  supervisor,
  organization,
}: IProps) {
  const r = e.raw;

  return (
    <>
      <If is={!!r.bio}>
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Биография
          </p>
          <div className="flex gap-3 p-4 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <FileText size={15} className="text-indigo-400" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
              {r.bio}
            </p>
          </div>
        </div>
      </If>

      <Section title="Персональные данные">
        <Field
          icon={<Calendar size={15} />}
          label="Дата рождения"
          value={formatDate(r.birth_date)}
        />
        <Field
          icon={<User size={15} />}
          label="Пол"
          value={genderLabel(r.gender)}
        />
        <Field
          icon={<ScrollText size={15} />}
          label="Номер паспорта"
          value={passport}
        />
        <Field icon={<Hash size={15} />} label="ИНН" value={r.inn} />
        <Field
          icon={<MapPin size={15} />}
          label="Адрес"
          value={r.address}
        />
        <Field
          icon={<CreditCard size={15} />}
          label="Банковский счёт"
          value={r.bank_account}
        />
      </Section>

      <Section title="Рабочие данные">
        <Field
          icon={<Briefcase size={15} />}
          label="Должность"
          value={e.position}
        />
        <Field
          icon={<Building2 size={15} />}
          label="Отдел"
          value={e.department}
        />
        <Field
          icon={<Landmark size={15} />}
          label="Организация"
          value={organization}
        />
        <Field
          icon={<Users size={15} />}
          label="Руководитель"
          value={supervisor}
        />
        <Field icon={<Shield size={15} />} label="Роль" value={roles} />
        <Field
          icon={<Mail size={15} />}
          label="Персональный Email"
          value={e.personalEmail}
        />
        <Field
          icon={<Phone size={15} />}
          label="Персональный телефон"
          value={e.personalPhone}
        />
        <Field
          icon={<Mail size={15} />}
          label="Корпоративный Email"
          value={e.corporateEmail}
        />
        <Field
          icon={<Phone size={15} />}
          label="Корпоративный телефон"
          value={e.corporatePhone}
        />
        <Field
          icon={<Phone size={15} />}
          label="Логин"
          value={r.phone}
        />
        <Field
          icon={<Wallet size={15} />}
          label="Заработная плата"
          value={money(e.salary)}
          accent
        />
      </Section>
    </>
  );
}
