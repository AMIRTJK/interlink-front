import React from "react";
import { Modal } from "antd";
import { MenuItem } from "../model";
import { FolderViewContent } from "../lib/FolderViewContent";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  folder: MenuItem;
}

export const ExpandedFolderViewModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  folder,
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={900}
      modalRender={() => (
        <FolderViewContent folder={folder} onClose={onClose} />
      )}
    />
  );
};
