import { useState } from "react";
import { IEmployee, initials, statusMeta } from "./model";

// Аватар сотрудника (фото или инициалы, с плавным переходом при ошибке 404)
export const Avatar = ({
  e,
  size = 40,
  rounded = "rounded-full",
}: {
  e: IEmployee;
  size?: number;
  rounded?: string;
}) => {
  const [hasError, setHasError] = useState(false);

  return e.photo && !hasError ? (
    <img
      src={e.photo}
      alt={e.fullName}
      className={`${rounded} object-cover flex-shrink-0`}
      style={{ width: size, height: size }}
      onError={() => {
        setHasError(true);
      }}
    />
  ) : (
    <div
      className={`${rounded} bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs`}
      style={{ width: size, height: size }}
    >
      {initials(e.fullName)}
    </div>
  );
};

// Чип статуса
export const StatusChip = ({ status }: { status: string }) => {
  const m = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${m.chip}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};
