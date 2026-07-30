import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getOccupancyColor } from '../../lib';
import type { IEmployee, IStaffingPosition, IAssignModalTarget } from '../../model';
import { If } from '@shared/ui/If';
import { PositionRowEditForm } from './positionRow/PositionRowEditForm';
import { PositionRowDisplayView } from './positionRow/PositionRowDisplayView';

export interface IPositionRowProps {
  pos: IStaffingPosition;
  index: number;
  orgId: number;
  deptId: number;
  employees: IEmployee[];
  dark?: boolean;
  onDelete: (orgId: number, deptId: number, posId: number) => void;
  onUpdate: (
    orgId: number,
    deptId: number,
    posId: number,
    updated: Partial<IStaffingPosition>
  ) => void;
  onOpenAssign: (target: IAssignModalTarget) => void;
  onUnassign: (orgId: number, deptId: number, posId: number, empId: number) => void;
}

export const PositionRow = ({
  pos,
  index,
  orgId,
  deptId,
  dark = false,
  onDelete,
  onUpdate,
  onOpenAssign,
  onUnassign,
}: IPositionRowProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(pos.name);
  const [editSlots, setEditSlots] = useState(String(pos.slots));
  const [editOccupied, setEditOccupied] = useState(String(pos.occupied));
  const [editSalary, setEditSalary] = useState(String(pos.salary));
  const [exiting, setExiting] = useState(false);

  const pct = pos.slots > 0 ? Math.round((pos.occupied / pos.slots) * 100) : 0;
  const colors = getOccupancyColor(pct);
  const editVacant = Math.max(0, Number(editSlots) - Number(editOccupied));

  const handleDelete = () => {
    setExiting(true);
    setTimeout(() => onDelete(orgId, deptId, pos.id), 320);
  };

  const handleSave = () => {
    onUpdate(orgId, deptId, pos.id, {
      name: editName || pos.name,
      slots: Number(editSlots) || 1,
      occupied: Number(editOccupied) || 0,
      vacant: editVacant,
      salary: parseFloat(editSalary) || 0,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditName(pos.name);
    setEditSlots(String(pos.slots));
    setEditOccupied(String(pos.occupied));
    setEditSalary(String(pos.salary));
  };

  const rowBorder = dark ? 'border-gray-700/40' : 'border-gray-50';
  const rowHover = dark ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50/80';
  const editBg = dark ? 'bg-gray-800/60' : 'bg-indigo-50/60';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={
        exiting
          ? { opacity: 0, x: 24, scale: 0.94 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, y: -8 }}
      transition={exiting ? { duration: 0.28 } : { delay: index * 0.04 }}
      className={`border-b ${rowBorder} last:border-0 transition-colors group ${
        editing ? editBg : rowHover
      }`}
    >
      <If is={editing}>
        <PositionRowEditForm
          pos={pos}
          dark={dark}
          editName={editName}
          setEditName={setEditName}
          editSlots={editSlots}
          setEditSlots={setEditSlots}
          editOccupied={editOccupied}
          setEditOccupied={setEditOccupied}
          editSalary={editSalary}
          setEditSalary={setEditSalary}
          editVacant={editVacant}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </If>
      <If is={!editing}>
        <PositionRowDisplayView
          pos={pos}
          index={index}
          orgId={orgId}
          deptId={deptId}
          pct={pct}
          colors={colors}
          dark={dark}
          onUnassign={onUnassign}
          onOpenAssign={onOpenAssign}
          onStartEditing={() => setEditing(true)}
          onDelete={handleDelete}
        />
      </If>
    </motion.div>
  );
};
