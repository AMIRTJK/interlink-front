import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IEmployee } from '../../../model';
import { MiniAvatar } from '../../components/MiniAvatar';
import { If } from '@shared/ui/If';
import { IAssignModalTheme } from './assignEmployeeModalModel';

interface IProps {
  assignedEmps: IEmployee[];
  onUnassign: (empId: number) => void;
  dark: boolean;
  theme: IAssignModalTheme;
}

export const AssignedEmployeesBlock = ({
  assignedEmps,
  onUnassign,
  dark,
  theme,
}: IProps) => (
  <AnimatePresence>
    <If is={assignedEmps.length > 0}>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`${theme.assignedBg} rounded-2xl p-3 mb-3 overflow-hidden`}
      >
        <p
          className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${
            dark ? 'text-indigo-400' : 'text-indigo-500'
          }`}
        >
          Назначены
        </p>
        <div className="flex flex-col gap-1">
          <AnimatePresence>
            {assignedEmps.map((emp) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
                className={`flex items-center gap-2.5 ${theme.assignedItemBg} rounded-xl px-2.5 py-1.5 shadow-sm`}
              >
                <MiniAvatar
                  photo={emp.avatarPhoto}
                  initials={emp.avatarInitials}
                  color={emp.avatarColor}
                  size="xs"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${theme.nameText}`}>
                    {emp.lastName} {emp.firstName}
                  </p>
                </div>
                <button
                  onClick={() => onUnassign(emp.id)}
                  className={`p-1 rounded-lg transition-colors ${
                    dark
                      ? 'text-gray-500 hover:text-red-400'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <X size={11} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </If>
  </AnimatePresence>
);
