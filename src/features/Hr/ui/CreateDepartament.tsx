import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { CreateDepartmentDTO } from '@entities/hr';
import { ApiRoutes } from '@shared/api';
import { useMutationQuery } from '@shared/lib';
import { If } from '@shared/ui';

export const CreateDepartment = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  const { mutate, isPending, isAllowed } = useMutationQuery<CreateDepartmentDTO>({
    url: ApiRoutes.CREATE_DEPARTMENT,
    method: "POST",
    messages: {
      invalidate: [ApiRoutes.GET_DEPARTMENTS]
    },
    preload: true,
    preloadConditional: ["departments.create"]
  });

  const handleSubmit = () => {
    const newErrors: { name?: string; code?: string } = {};
    if (!name.trim()) newErrors.name = 'Введите название (напр. Юридический отдел)';
    if (!code.trim()) newErrors.code = 'Введите код (напр. legal2)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    mutate({ name: name.trim(), code: code.trim() } as CreateDepartmentDTO, {
      onSuccess: () => {
        setName('');
        setCode('');
      }
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3.5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
          <FolderPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            Создать отдел
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Добавление нового отдела в структуру
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">
            Название отдела
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Юридический отдел 2"
            disabled={!isAllowed}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
          <If is={errors.name}>
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          </If>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5">
            Код отдела
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="legal2"
            disabled={!isAllowed}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
          <If is={errors.code}>
            <p className="mt-1 text-xs text-red-500">{errors.code}</p>
          </If>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isAllowed || isPending}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-900/30 disabled:opacity-50 cursor-pointer transition-colors"
        >
          {isPending ? 'Создание...' : 'Создать отдел'}
        </button>
      </div>
    </div>
  );
};