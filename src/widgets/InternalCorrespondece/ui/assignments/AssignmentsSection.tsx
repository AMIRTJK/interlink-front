import React, { useState } from "react";
import { Button, Empty, Spin } from "antd";
import { PlusOutlined, FileDoneOutlined } from "@ant-design/icons";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";
import { AssignmentItem } from "./AssignmentItem";
import { CreateAssignmentModal } from "./CreateAssignmentModal";
import { AssignmentResultModal } from "./AssignmentResultModal";
import type { IAssignmentItem } from "./types";

interface IProps {
  docId: string | number;
  currentUserId: string | number | null;
  isDarkMode?: boolean;
}

export const AssignmentsSection: React.FC<IProps> = ({
  docId,
  currentUserId,
  isDarkMode,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    assignmentId: number | null;
    mode: "submit" | "review";
  }>({
    isOpen: false,
    assignmentId: null,
    mode: "submit",
  });

  const { data: assignmentsResponse, isLoading, refetch } = useGetQuery({
    url: docId ? ApiRoutes.INTERNAL_ASSIGNMENTS.replace(":id", String(docId)) : "",
    useToken: true,
    options: { enabled: !!docId },
  });

  const items: IAssignmentItem[] =
    assignmentsResponse?.data?.items || assignmentsResponse?.items || [];

  const handleOpenSubmit = (assignmentId: number) => {
    setActiveModal({ isOpen: true, assignmentId, mode: "submit" });
  };

  const handleOpenReview = (assignmentId: number) => {
    setActiveModal({ isOpen: true, assignmentId, mode: "review" });
  };

  const handleCloseActiveModal = () => {
    setActiveModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-gray-400">
          <FileDoneOutlined />
          <span>Поручения ({items.length})</span>
        </div>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600! hover:bg-indigo-500! text-xs!"
        >
          Создать поручение
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spin size="small" />
        </div>
      ) : items.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-xs text-gray-400">Поручений пока нет</span>}
        />
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {items.map((item) => (
            <AssignmentItem
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              isDarkMode={isDarkMode}
              onSubmitResult={handleOpenSubmit}
              onReviewResult={handleOpenReview}
            />
          ))}
        </div>
      )}

      <CreateAssignmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        docId={docId}
        isDarkMode={isDarkMode}
        onSuccess={refetch}
      />

      <AssignmentResultModal
        isOpen={activeModal.isOpen}
        onClose={handleCloseActiveModal}
        assignmentId={activeModal.assignmentId}
        mode={activeModal.mode}
        isDarkMode={isDarkMode}
        onSuccess={refetch}
      />
    </div>
  );
};
