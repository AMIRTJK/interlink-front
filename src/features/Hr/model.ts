// PERMISSION_TRANSLATIONS
export const PERMISSION_TRANSLATIONS: Record<string, string> = {
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
// SUPPLEMENTARY_PERMISSIONS
export const SUPPLEMENTARY_PERMISSIONS = [
  { value: 'analytics.view', label: PERMISSION_TRANSLATIONS['analytics.view'] },
  { value: 'analytics.export', label: PERMISSION_TRANSLATIONS['analytics.export'] },
  { value: 'approvals.view', label: PERMISSION_TRANSLATIONS['approvals.view'] },
  { value: 'approvals.create', label: PERMISSION_TRANSLATIONS['approvals.create'] },
  { value: 'approvals.sign', label: PERMISSION_TRANSLATIONS['approvals.sign'] },
  { value: 'approvals.reject', label: PERMISSION_TRANSLATIONS['approvals.reject'] },
  { value: 'system.logs.view', label: PERMISSION_TRANSLATIONS['system.logs.view'] },
  { value: 'profile.edit_own', label: PERMISSION_TRANSLATIONS['profile.edit_own'] },
];