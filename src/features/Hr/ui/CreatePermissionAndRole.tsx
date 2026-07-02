/**
 * Неиспользуемый компонент (нигде не подключён ни к одному роуту).
 * Оставлен закомментированным на случай, если понадобится в будущем.
 * Хардкод SUPPLEMENTARY_PERMISSIONS убран перед заморозкой — см. аналогичный
 * фикс в widgets/Hr/Access/ui/CreateRoleModal.tsx.
 */
export {};

// import { CreatePermissionAndRoleDTO } from '@entities/hr';
// import { ApiRoutes } from '@shared/api';
// import { useMutationQuery } from '@shared/lib';
// import { SelectField } from '@shared/ui';
// import { Form, Input, Button, Card } from 'antd';
// import { PERMISSION_TRANSLATIONS } from '../model';
//
// interface IProps {
//   name: string;
//   label?: string;
// }
//
// export const CreatePermissionAndRole = () => {
//   const { mutate, isPending } = useMutationQuery<CreatePermissionAndRoleDTO>({
//     url: ApiRoutes.CREATE_ROLE,
//     method: "POST",
//     messages: { success: "Роль успешно создана", invalidate: [ApiRoutes.GET_ROLES] }
//   });
//
//   const transformPermissions = (response: unknown) => {
//     const data = (response as { data: IProps[] })?.data || [];
//     return data.map((p) => ({
//       value: p.name,
//       label: PERMISSION_TRANSLATIONS[p.name] || p.label || p.name
//     }));
//   };
//
//   return (
//     <Card title="Конструктор Ролей и Прав" style={{ maxWidth: 500 }}>
//       <Form layout="vertical" onFinish={(v) => mutate(v)}>
//         <Form.Item name="name" label="Имя роли" rules={[{ required: true }]}><Input placeholder="manager" /></Form.Item>
//         <SelectField
//           name="permissions"
//           label="Список разрешений"
//           rules={[{ required: true }]}
//           method='GET'
//           url={`${ApiRoutes.FETCH_PERMISSIONS}`}
//           isFetchAllowed={true}
//           transformResponse={transformPermissions}
//           placeholder="Выберите права"
//           mode="multiple"
//         />
//         <Button type="primary" htmlType="submit" loading={isPending} block>Создать связку</Button>
//       </Form>
//     </Card>
//   );
// };
