import { CSS_CLASSES } from "./constants";

export interface IProps {
  handleDragStart: (e: React.DragEvent, folderId: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (
    e: React.DragEvent,
    targetFolderId: number,
    onDrop: (targetFolderId: number | null, draggedType: "folder" | "correspondence", draggedId: number) => void
  ) => void;
}

export const createDragHandlers = (): IProps => {
  return {
    handleDragStart: (e: React.DragEvent, folderId: number) => {
      e.dataTransfer.setData("folderId", folderId.toString());
      e.dataTransfer.effectAllowed = "move";
    },

    handleDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      e.currentTarget.classList.add(CSS_CLASSES.DRAG_OVER);
    },

    handleDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove(CSS_CLASSES.DRAG_OVER);
    },

    handleDrop: (
      e: React.DragEvent,
      targetFolderId: number,
      onDrop: (targetFolderId: number | null, draggedType: "folder" | "correspondence", draggedId: number) => void
    ) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove(CSS_CLASSES.DRAG_OVER);

      const folderIdStr = e.dataTransfer.getData("folderId");
      const correspondenceIdStr = e.dataTransfer.getData("correspondenceId");

      if (folderIdStr) {
        onDrop(targetFolderId, "folder", Number(folderIdStr));
      } else if (correspondenceIdStr) {
        onDrop(targetFolderId, "correspondence", Number(correspondenceIdStr));
      }
    },
  };
};
