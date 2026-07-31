import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { IEmployee } from '../../../model';
import { MiniAvatar } from '../../components/MiniAvatar';
import { If } from '@shared/ui/If';
import { IAssignModalTheme } from './assignEmployeeModalModel';

interface IProps {
  filtered: IEmployee[];
  assignedIds: number[];
  isFull: boolean;
  onAssign: (emp: IEmployee) => void;
  onUnassign: (empId: number) => void;
  dark: boolean;
  theme: IAssignModalTheme;
}

export const EmployeePickList = ({
  filtered,
  assignedIds,
  isFull,
  onAssign,
  onUnassign,
  dark,
  theme,
}: IProps) => (
  <div className="flex-1 overflow-y-auto p-2">
    {filtered.map((emp, i) => {
      const isAssigned = assignedIds.includes(emp.id);
      const cannotAdd = !isAssigned && isFull;

      return (
        <motion.div
          key={emp.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.02 }}
          onClick={() =>
            cannotAdd
              ? undefined
              : isAssigned
              ? onUnassign(emp.id)
              : onAssign(emp)
          }
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 transition-all ${
            cannotAdd ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
          } ${
            isAssigned
              ? dark
                ? 'bg-emerald-900/10 ring-1 ring-emerald-700/30'
                : 'bg-emerald-50 ring-1 ring-emerald-200'
              : theme.rowHover
          }`}
        >
          <MiniAvatar
            photo={emp.avatarPhoto}
            initials={emp.avatarInitials}
            color={emp.avatarColor}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${theme.nameText}`}>
              {emp.lastName} {emp.firstName}
            </p>
            <p className={`text-xs truncate ${theme.subText}`}>{emp.position}</p>
          </div>
          <If is={isAssigned}>
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Check size={11} className="text-white" />
            </div>
          </If>
        </motion.div>
      );
    })}
  </div>
);
