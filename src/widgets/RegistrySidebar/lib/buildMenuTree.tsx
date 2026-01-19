import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import folderIcon from "../../../assets/icons/folder-icon.svg";

interface BuildMenuTreeParams {
  // navigate: (path: string) => void;
  // counts: any;
  folders: any[];
  collapsed: boolean;
  definitions: Record<string, any>;
  handleEditClick: (folderId: number, currentName: string) => void;
  deleteFolder: (data: { id: number }) => void;
}

export const buildMenuTree = ({
  folders,
  collapsed,
  definitions,
  handleEditClick,
  deleteFolder,
  // counts,
  // navigate,
}: BuildMenuTreeParams) => {
  const buildFullItem = (folder: any, visited = new Set<number>()): any => {
    if (folder.id && visited.has(folder.id)) return null;
    if (folder.id) visited.add(folder.id);

    const def = definitions[folder.name];
    const isIncomingOrOutgoing = folder.name === "Входящие письма" || folder.name === "Исходящие письма";
    const folderKey = def ? def.key : `folder-${folder.id}`;

    // Рендерим детей
    const nestedFolders = folders
      .filter((f: any) => f.parent_id === folder.id)
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((f: any) => buildFullItem(f, new Set(visited)))
      .filter(Boolean);

    let children: any[] | undefined = nestedFolders.length > 0 ? nestedFolders : undefined;

    // Добавляем плейсхолдер для Входящих/Исходящих
    if (isIncomingOrOutgoing) {
      const createPlaceholder = {
        key: `create-placeholder-${folder.id || folder.name}`,
        icon: <PlusOutlined />,
        label: <span className="text-[#0037AF] font-medium">Создать новую папку</span>,
        parent_id: folder.id || null,
      };
      children = children ? [createPlaceholder, ...children] : [createPlaceholder];
    }

    // Контекстное меню для папок
    const menuActions: MenuProps["items"] = [];
    if (folderKey.toString().startsWith("folder-")) {
      menuActions.push(
        {
          key: "edit",
          label: "Редактировать",
          icon: <EditOutlined />,
          onClick: (e) => {
            e.domEvent.stopPropagation();
            handleEditClick(folder.id, folder.name);
          },
        },
        {
          key: "delete",
          label: "Удалить",
          icon: <DeleteOutlined className="text-red-500" />,
          onClick: (e) => {
            e.domEvent.stopPropagation();
            deleteFolder({ id: folder.id });
          },
        }
      );
    }

    return {
      key: folderKey,
      folderName: folder.name,
      icon: def ? def.icon : <img src={folderIcon} />,
      path: def ? def.path : `/modules/correspondence/folders?folderId=${folder.id}`,
      children,
      label: (
        <div className="flex justify-between items-center w-full group overflow-hidden pr-2">
          <span className="truncate">{folder.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            {(def ? def.count : undefined) !== undefined && !collapsed && (
              <span className="bg-[#E30613] text-white text-[11px] font-bold px-1.5 rounded-full min-w-6 h-6 flex items-center justify-center">
                {def.count}
              </span>
            )}
            {!collapsed && menuActions.length > 0 && (
              <Dropdown menu={{ items: menuActions }} trigger={["click"]} placement="bottomRight">
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100"
                />
              </Dropdown>
            )}
          </div>
        </div>
      )
    };
  };

  // Строим корневые элементы
  const rootItems = folders
    .filter((f: any) => f.parent_id === null || f.parent_id === undefined)
    .sort((a: any, b: any) => a.sort - b.sort)
    .map((f: any) => buildFullItem(f))
    .filter(Boolean);

  // Добавляем недостающие системные папки (если их нет в БД)
  Object.keys(definitions).forEach(name => {
    if (!rootItems.find(i => i.folderName === name || i.key === definitions[name].key)) {
      const def = definitions[name];
      rootItems.push({
        key: def.key,
        folderName: name,
        icon: def.icon,
        label: (
          <div className="flex justify-between items-center w-full overflow-hidden pr-2">
            <span>{name}</span>
            <div className="flex items-center gap-2 shrink-0">
              {def.count !== undefined && def.count > 0 && !collapsed && (
                <span className="bg-[#E30613] text-white text-[11px] font-bold px-1.5 rounded-full min-w-6 h-6 flex items-center justify-center">
                  {def.count}
                </span>
              )}
            </div>
          </div>
        ),
        path: def.path,
      });
    }
  });

  const topNames = ["Входящие письма", "Исходящие письма"];
  const bottomNames = ["Архив", "Закреплённые", "Корзина"];

  const topItems = rootItems
    .filter(i => topNames.includes(i.folderName))
    .sort((a,b) => topNames.indexOf(a.folderName) - topNames.indexOf(b.folderName));

  const bottomItems = rootItems
    .filter(i => bottomNames.includes(i.folderName))
    .sort((a,b) => bottomNames.indexOf(a.folderName) - bottomNames.indexOf(b.folderName));

  const midItems = rootItems.filter(i => !topNames.includes(i.folderName) && !bottomNames.includes(i.folderName));

  return [...topItems, ...midItems, ...bottomItems];
};
