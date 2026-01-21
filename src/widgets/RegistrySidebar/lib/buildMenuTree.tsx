import { PlusOutlined, MoreOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import folderIcon from "../../../assets/icons/folder-icon.svg";
import trashIcon from "../../../assets/icons/trash-icon.svg";

interface BuildMenuTreeParams {
  // navigate: (path: string) => void;
  // counts: any;
  folders: any[];
  collapsed: boolean;
  definitions: Record<string, any>;
  handleEditClick: (folderId: number, currentName: string) => void;
  deleteFolder: (data: { id: number }) => void;
  handleAddClick: (parentId: number | null) => void;
  onNavigate: (path: string) => void;
  onDrop: (targetFolderId: number | null, draggedType: "folder" | "correspondence", draggedId: number) => void;
}

export const buildMenuTree = ({
  folders,
  collapsed,
  definitions,
  handleEditClick,
  deleteFolder,
  handleAddClick,
  onNavigate,
  onDrop,
  // counts,
  // navigate,
}: BuildMenuTreeParams) => {
  const buildFullItem = (folder: any, visited = new Set<number>(), depth = 0): any => {
    if (folder.id && visited.has(folder.id)) return null;
    if (folder.id) visited.add(folder.id);

    const def = definitions[folder.name];
    const isIncomingOrOutgoing = folder.name === "Входящие письма" || folder.name === "Исходящие письма";
    const folderKey = def ? def.key : `folder-${folder.id}`;

    // Функция для определения родительской системной папки (Входящие/Исходящие)
    const getParentSystemFolder = (folderId: number): string | null => {
      const findParent = (id: number): any => {
        const currentFolder = folders.find((f: any) => f.id === id);
        if (!currentFolder) return null;
        
        // Если это системная папка
        if (currentFolder.name === "Входящие письма") return "incoming";
        if (currentFolder.name === "Исходящие письма") return "outgoing";
        
        // Если есть родитель, ищем дальше
        if (currentFolder.parent_id) {
          return findParent(currentFolder.parent_id);
        }
        
        return null;
      };
      
      return findParent(folderId);
    };

    // Формируем path для пользовательских папок
    let folderPath = def ? def.path : `/modules/correspondence/folders?folderId=${folder.id}`;
    
    // Если это пользовательская папка (не системная), определяем родителя
    if (!def && folder.id) {
      const parentType = getParentSystemFolder(folder.id);
      if (parentType === "incoming") {
        folderPath = `/modules/correspondence/incoming?folderId=${folder.id}`;
      } else if (parentType === "outgoing") {
        folderPath = `/modules/correspondence/outgoing?folderId=${folder.id}`;
      }
    }

    // Рендерим детей
    const nestedFolders = folders
      .filter((f: any) => f.parent_id === folder.id)
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((f: any) => buildFullItem(f, new Set(visited), depth + 1))
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
          icon: <EditOutlined className="text-[#0037AF]!" />,
          onClick: (e) => {
            e.domEvent.stopPropagation();
            handleEditClick(folder.id, folder.name);
          },
        }
      );
      
      // Показываем "Создать папку" только если глубина меньше 5
      if (depth < 5) {
        menuActions.push({
          key: "create-sub",
          label: "Создать папку",
          icon: <PlusOutlined className="text-[#0037AF]!" />,
          onClick: (e) => {
            e.domEvent.stopPropagation();
            handleAddClick(folder.id);
          },
        });
      }

      menuActions.push({
          key: "delete",
          label: "Удалить",
          danger: true,
          icon: <img src={trashIcon} className="w-5 h-5" />,
          onClick: (e) => {
            e.domEvent.stopPropagation();
            deleteFolder({ id: folder.id });
          },
        }
      );
    }

    const handleSidebarDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove("folder-drag-over");
      
      const folderIdStr = e.dataTransfer.getData("folderId");
      const correspondenceIdStr = e.dataTransfer.getData("correspondenceId");

      if (folderIdStr) {
        onDrop(folder.id, "folder", Number(folderIdStr));
      } else if (correspondenceIdStr) {
        onDrop(folder.id, "correspondence", Number(correspondenceIdStr));
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      e.currentTarget.classList.add("folder-drag-over");
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove("folder-drag-over");
    };

    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData("folderId", folder.id.toString());
      e.dataTransfer.effectAllowed = "move";
    };

    return {
      key: folderKey,
      folderName: folder.name,
      icon: def ? def.icon : <img src={folderIcon} />,
      path: folderPath,
      children,
      onTitleClick: () => {
        // Ant Design Menu workaround if needed
      },
      label: (
        <div 
          className="flex items-center w-full group overflow-hidden h-full gap-0"
          draggable={!def} // Системные папки нельзя таскать
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleSidebarDrop}
        >
          <div 
            className="flex items-center flex-1 overflow-hidden cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (folderPath) {
                onNavigate(folderPath);
              }
            }}
          >
            <span className="mr-5">{folder.name}</span>
          </div>
          
          {/* Ячейка для счётчика (всегда 40px, вторая с конца) */}
          <div className="w-10 shrink-0 flex items-center justify-center">
            {(def ? def.count : undefined) !== undefined && !collapsed && (
              <span className="bg-[#E30613] text-white text-[11px] font-bold px-1.5 rounded-full min-w-6 h-6 flex items-center justify-center">
                {def.count}
              </span>
            )}
          </div>

          {/* Ячейка для действий/стрелки (всегда 40px, в самом конце) */}
          <div className="w-10 shrink-0 flex items-center justify-center relative">
            {!collapsed && menuActions.length > 0 && (
              <Dropdown 
                menu={{ items: menuActions }} 
                trigger={["click"]} 
                placement="bottomRight"
                overlayClassName="custom-registry-dropdown"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
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
          <div className="flex items-center w-full overflow-hidden h-full gap-0">
            <div 
              className="flex items-center flex-1 overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (def.path) {
                  onNavigate(def.path);
                }
              }}
            >
              <span className="truncate flex-1 pr-1">{name}</span>
            </div>
            <div className="w-10 shrink-0 flex items-center justify-center">
              {def.count !== undefined && def.count > 0 && !collapsed && (
                <span className="bg-[#E30613] text-white text-[11px] font-bold px-1.5 rounded-full min-w-6 h-6 flex items-center justify-center">
                  {def.count}
                </span>
              )}
            </div>
            {/* Пустая ячейка для выравнивания с папками, где есть кнопки/стрелки */}
            <div className="w-10 shrink-0" />
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
