import { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { CreateOrganizationDTO } from '@entities/hr';
import { ApiRoutes } from '@shared/api';
import { useMutationQuery } from '@shared/lib';
import { If } from '@shared/ui';

const INPUT_CLS =
  'w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white border-slate-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

const LABEL_CLS = 'block text-xs font-semibold text-gray-500 mb-1.5';

export const CreateOrganization = () => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [code, setCode] = useState('');
  const [inn, setInn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [metaType, setMetaType] = useState('client');
  const [metaNote, setMetaNote] = useState('');
  const [nameError, setNameError] = useState(false);

  const { mutate, isPending, isAllowed } = useMutationQuery<CreateOrganizationDTO>({
    url: ApiRoutes.CREATE_ORGANIZATION,
    method: 'POST',
    messages: { success: 'Организация создана', invalidate: [ApiRoutes.GET_ORGANIZATIONS] },
    preload: true,
    preloadConditional: ['organizations.create'],
  });

  const resetFields = () => {
    setName('');
    setShortName('');
    setCode('');
    setInn('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setAddress('');
    setMetaType('client');
    setMetaNote('');
    setNameError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    const payload: CreateOrganizationDTO = {
      name,
      short_name: shortName,
      code,
      inn,
      phone,
      email,
      website,
      address,
      meta: { type: metaType, note: metaNote },
    };
    mutate(payload, { onSuccess: resetFields });
  };

  const disabled = !isAllowed;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Создать организацию</h2>
            <p className="text-sm text-gray-400">Заполните данные новой организации</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <fieldset className="space-y-4">
          <p className="text-sm font-semibold text-gray-700">Основная информация</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Название *</label>
              <input
                className={`${INPUT_CLS} ${nameError ? 'border-red-400! ring-2 ring-red-500/20!' : ''}`}
                placeholder="Введите название"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(false); }}
                disabled={disabled}
              />
              <If is={nameError}>
                <p className="mt-1 text-xs text-red-500">Название обязательно для заполнения</p>
              </If>
            </div>
            <div>
              <label className={LABEL_CLS}>Краткое название</label>
              <input className={INPUT_CLS} placeholder="Краткое название" value={shortName} onChange={(e) => setShortName(e.target.value)} disabled={disabled} />
            </div>
            <div>
              <label className={LABEL_CLS}>Код организации</label>
              <input className={INPUT_CLS} placeholder="Код" value={code} onChange={(e) => setCode(e.target.value)} disabled={disabled} />
            </div>
            <div>
              <label className={LABEL_CLS}>ИНН</label>
              <input className={INPUT_CLS} placeholder="ИНН" value={inn} onChange={(e) => setInn(e.target.value)} disabled={disabled} />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <p className="text-sm font-semibold text-gray-700">Контактные данные</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Телефон</label>
              <input className={INPUT_CLS} placeholder="+7 (000) 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={disabled} />
            </div>
            <div>
              <label className={LABEL_CLS}>Email</label>
              <input className={INPUT_CLS} placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={disabled} />
            </div>
            <div>
              <label className={LABEL_CLS}>Веб-сайт</label>
              <input className={INPUT_CLS} placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={disabled} />
            </div>
            <div>
              <label className={LABEL_CLS}>Адрес</label>
              <input className={INPUT_CLS} placeholder="Город, улица, дом" value={address} onChange={(e) => setAddress(e.target.value)} disabled={disabled} />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <p className="text-sm font-semibold text-gray-700">Дополнительно</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Тип</label>
              <input className={INPUT_CLS} placeholder="client" value={metaType} onChange={(e) => setMetaType(e.target.value)} disabled={disabled} />
            </div>
            <div>
              <label className={LABEL_CLS}>Заметка</label>
              <input className={INPUT_CLS} placeholder="Заметка" value={metaNote} onChange={(e) => setMetaNote(e.target.value)} disabled={disabled} />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={disabled || isPending}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-900/30 disabled:opacity-50 cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          <If is={isPending}>
            <Loader2 className="w-4 h-4 animate-spin" />
          </If>
          Создать
        </button>
      </form>
    </div>
  );
};