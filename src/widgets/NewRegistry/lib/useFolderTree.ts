
import { useMemo } from "react";
import { IFolder } from "../model";

/**
 * Тип узла дерева для Ant Design Tree
 */
export type TFolderTreeNode = {
  title: string;
  key: number;
  folder: IFolder;
  children: TFolderTreeNode[];
};

/**
 * Хук для управления деревом папок: построение и фильтрация
 */
export const useFolderTree = (
  folders: IFolder[],
  searchQuery: string
): TFolderTreeNode[] => {
  return useMemo(() => {
    /**
     * Рекурсивная функция для сборки дерева папок
     */
    const buildTree = (parentId: number | null = null): TFolderTreeNode[] => {
      return folders
        .filter((f) => f.parent_id === parentId)
        .map((f) => ({
          title: f.name,
          key: f.id,
          folder: f,
          children: buildTree(f.id),
        }));
    };

    const fullTree = buildTree();

    if (!searchQuery) return fullTree;

    /**
     * Рекурсивная фильтрация дерева по поисковому запросу
     */
    const filterTree = (nodes: TFolderTreeNode[]): TFolderTreeNode[] => {
      return nodes
        .map((node) => {
          const match = node.title.toLowerCase().includes(searchQuery.toLowerCase());
          const filteredChildren = node.children ? filterTree(node.children) : [];
          
          if (match || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter((node): node is TFolderTreeNode => node !== null);
    };

    return filterTree(fullTree);
  }, [folders, searchQuery]);
};
