
import { useMemo } from "react";
import { Folder } from "lucide-react";
import { IFolder } from "../model/types";
import React from "react";

/**
 * Тип узла дерева для Ant Design Tree
 */
export type TFolderTreeNode = {
  title: string;
  key: number;
  folder: IFolder;
  children: TFolderTreeNode[];
  icon: React.ReactNode;
};

/**
 * Хук для управления деревом папок: построение и фильтрация
 */
export const useFolderTree = (
  folders: IFolder[],
  searchQuery: string,
  selectedFolderId: number | null
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
          icon: React.createElement(Folder, {
            size: 16,
            className: selectedFolderId === f.id ? "text-blue-500" : "text-gray-400"
          }),
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
  }, [folders, searchQuery, selectedFolderId]);
};
