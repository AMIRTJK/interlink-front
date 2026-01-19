import { CreatePermissionAndRoleDTO } from '@entities/hr';
import { ApiRoutes } from '@shared/api';
import { useMutationQuery } from '@shared/lib';
import { SelectField } from '@shared/ui';
import { Form, Input, Button, Card } from 'antd';

const PERMISSION_TRANSLATIONS: Record<string, string> = {
  // Пользователи
  'users.view': 'Просмотр пользователей',
  'users.create': 'Создание пользователей',
  'users.update': 'Редактирование пользователей',
  'users.delete': 'Удаление пользователей',
  
  // Роли
  'roles.view': 'Просмотр ролей',
  'roles.create': 'Создание ролей',
  'roles.update': 'Редактирование ролей',
  'roles.delete': 'Удаление ролей',

  // Права
  'permissions.view': 'Просмотр прав',
  'permissions.manage_ui': 'Управление интерфейсом прав',

  // Организации
  'organizations.view': 'Просмотр организаций',
  'organizations.create': 'Создание организаций',
  'organizations.update': 'Редактирование организаций',
  'organizations.delete': 'Удаление организаций',

  // Tasks
  'tasks.view': 'Просмотр задач',
  'tasks.create': 'Создание задач',
  'tasks.update': 'Редактирование задач',
  'tasks.delete': 'Удаление задач',

  // События
  'events.view': 'Просмотр событий',
  'events.create': 'Создание событий',
  'events.update': 'Редактирование событий',
  'events.delete': 'Удаление событий',

  // Письма
  'correspondence.view': 'Просмотр корреспонденции',
  'correspondence.create': 'Создание письма',
  'correspondence.update': 'Редактирование письма',
  'correspondence.delete': 'Удаление письма',
  'correspondence.register': 'Регистрация письма',
  'correspondence.assign': 'Назначение исполнителя',
  'correspondence.assignment.update_status': 'Изменение статуса поручения',
  'correspondence.view_all': 'Просмотр всей корреспонденции',
  'correspondence.update_all': 'Редактирование любой корреспонденции',
  'correspondence.assignment.update_any': 'Изменение любого поручения',

  // Департамент
  'departments.view': 'Просмотр департаментов',
  'departments.create': 'Создание департаментов',
  'departments.update': 'Редактирование департаментов',
  'departments.delete': 'Удаление департаментов',
  'departments.assign': 'Назначение в департамент',
  
  // Аналитика 
  'analytics.view': 'Просмотр аналитики',
  'analytics.export': 'Экспорт отчетов',
  'approvals.view': 'Просмотр согласований',
  'approvals.create': 'Создание согласования',
  'approvals.sign': 'Подписание документа',
  'approvals.reject': 'Отклонение документа',
  'system.logs.view': 'Просмотр системных логов',
  'profile.edit_own': 'Редактирование профиля'
};

const SUPPLEMENTARY_PERMISSIONS = [
  { value: 'analytics.view', label: PERMISSION_TRANSLATIONS['analytics.view'] },
  { value: 'analytics.export', label: PERMISSION_TRANSLATIONS['analytics.export'] },
  { value: 'approvals.view', label: PERMISSION_TRANSLATIONS['approvals.view'] },
  { value: 'approvals.create', label: PERMISSION_TRANSLATIONS['approvals.create'] },
  { value: 'approvals.sign', label: PERMISSION_TRANSLATIONS['approvals.sign'] },
  { value: 'approvals.reject', label: PERMISSION_TRANSLATIONS['approvals.reject'] },
  { value: 'system.logs.view', label: PERMISSION_TRANSLATIONS['system.logs.view'] },
  { value: 'profile.edit_own', label: PERMISSION_TRANSLATIONS['profile.edit_own'] },
];

interface PermissionItem {
  name: string;
  label?: string;
}

export const CreatePermissionAndRole = () => {
  const { mutate, isPending } = useMutationQuery<CreatePermissionAndRoleDTO>({
    url: ApiRoutes.CREATE_ROLE,
    method: "POST",
    messages: { success: "Роль успешно создана", invalidate: ["FETCH_ROLES"] }
  });

  const transformPermissions = (response: unknown) => {
    const data = (response as { data: PermissionItem[] })?.data || [];
    const serverItems = data.map((p) => ({
      value: p.name,
      label: PERMISSION_TRANSLATIONS[p.name] || p.label || p.name // Перевод или фоллбэк
    }));
    return [...serverItems, ...SUPPLEMENTARY_PERMISSIONS];
  };

  return (
    <Card title="Конструктор Ролей и Прав" style={{ maxWidth: 500 }}>
      <Form layout="vertical" onFinish={(v) => mutate(v)}>
        <Form.Item name="name" label="Имя роли" rules={[{ required: true }]}><Input placeholder="manager" /></Form.Item>
        <SelectField 
          name="permissions" 
          label="Список разрешений" 
          rules={[{ required: true }]}
          method='GET'
          url={`${ApiRoutes.FETCH_PERMISSIONS}`}
          isFetchAllowed={true}
          transformResponse={transformPermissions}
          placeholder="Выберите права"
          mode="multiple"
        />
        <Button type="primary" htmlType="submit" loading={isPending} block>Создать связку</Button>
      </Form>
    </Card>
  );
};