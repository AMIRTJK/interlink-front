import { useState, useEffect, memo } from "react";
import { X, Clock, Calendar, Trash2, Check, XCircle, AlignLeft, Users } from "lucide-react";
import { If } from "@shared/ui";
import type { Task } from "@features/tasks";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useCalendarTheme } from "../lib/useCalendarTheme";

dayjs.locale("ru");

type TRsvpStatus = "accepted" | "declined" | null;

interface IProps {
  event: Task | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const getAccentColor = (color?: string): string => color || "#10B981";

export const EventDetailsModal = memo(({ event, onClose, onDelete }: IProps) => {
  const [rsvpStatus, setRsvpStatus] = useState<TRsvpStatus>(null);
  const { theme } = useCalendarTheme();

  useEffect(() => {
    if (event) {
      document.body.style.overflow = "hidden";
      setRsvpStatus(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [event]);

  const handleAccept = () => setRsvpStatus("accepted");
  const handleDecline = () => setRsvpStatus("declined");

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <If is={!!event}>
      <div
        className="fixed! inset-0! z-50! flex! items-center! justify-center! p-4! bg-black/40! backdrop-blur-sm!"
        onClick={onClose}
      >
        <div
          className="bg-white! dark:bg-slate-900! rounded-3xl! shadow-2xl! w-full! max-w-md! overflow-hidden! animate-in! fade-in! zoom-in! duration-200!"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="h-2! w-full!"
            style={{ backgroundColor: getAccentColor(event?.color) }}
          />

          <div className="flex! items-start! justify-between! px-7! pt-6! pb-4!">
            <div className="flex! items-start! gap-3! flex-1! min-w-0!">
              <div
                className="w-3! h-3! rounded-full! flex-shrink-0! mt-1.5!"
                style={{ backgroundColor: getAccentColor(event?.color) }}
              />
              <h2 className="text-lg! font-bold! text-slate-800! dark:text-zinc-100! leading-snug! break-words!">
                {event?.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400! hover:text-slate-600! dark:hover:text-zinc-300! p-1.5! rounded-full! hover:bg-slate-100! dark:hover:bg-slate-800! transition-colors! cursor-pointer! flex-shrink-0! ml-3!"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-7! pb-6! space-y-3!">
            <div className="flex! items-center! gap-3! text-sm! text-slate-500! dark:text-zinc-400!">
              <Clock size={15} className="flex-shrink-0! text-slate-400!" />
              <span>
                {event?.time}
                {event?.endTime ? ` — ${event.endTime}` : ""}
              </span>
            </div>

            <div className="flex! items-center! gap-3! text-sm! text-slate-500! dark:text-zinc-400!">
              <Calendar size={15} className="flex-shrink-0! text-slate-400!" />
              <span>
                {event?.date
                  ? dayjs(event.date).format("D MMMM YYYY")
                  : ""}
              </span>
            </div>

            <If is={!!event?.description}>
              <div className="flex! items-start! gap-3! text-sm! text-slate-500! dark:text-zinc-400!">
                <AlignLeft size={15} className="flex-shrink-0! text-slate-400! mt-0.5!" />
                <p className="leading-relaxed! whitespace-pre-wrap! break-words!">
                  {event?.description}
                </p>
              </div>
            </If>

            <If is={!!event?.participants?.length}>
              <div className="flex! items-start! gap-3! text-sm! text-slate-500! dark:text-zinc-400!">
                <Users size={15} className="flex-shrink-0! text-slate-400! mt-0.5!" />
                <div className="flex! flex-wrap! gap-1.5!">
                  {event?.participants?.map((p) => (
                    <span
                      key={p.id}
                      className="px-2.5! py-0.5! bg-slate-100! dark:bg-slate-800! text-slate-600! dark:text-zinc-300! text-xs! font-medium! rounded-full!"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </If>

            <If is={rsvpStatus !== null}>
              <div
                className={`flex! items-center! gap-2! text-sm! font-semibold! px-4! py-2.5! rounded-2xl! ${
                  rsvpStatus === "accepted"
                    ? "bg-emerald-50! dark:bg-emerald-950/30! text-emerald-600! dark:text-emerald-400!"
                    : "bg-rose-50! dark:bg-rose-950/30! text-rose-500! dark:text-rose-400!"
                }`}
              >
                <If is={rsvpStatus === "accepted"}>
                  <Check size={15} />
                  <span>Вы приняли это событие</span>
                </If>
                <If is={rsvpStatus === "declined"}>
                  <XCircle size={15} />
                  <span>Вы отклонили это событие</span>
                </If>
              </div>
            </If>
          </div>

          <div className="flex! items-center! justify-between! px-7! py-4! border-t! border-slate-100! dark:border-slate-800!">
            <button
              type="button"
              onClick={handleDelete}
              className="flex! items-center! gap-1.5! text-rose-500! hover:text-rose-600! dark:hover:text-rose-400! text-sm! font-semibold! transition-colors! cursor-pointer!"
            >
              <Trash2 size={15} />
              <span>Удалить</span>
            </button>

            <div className="flex! items-center! gap-2!">
              <button
                type="button"
                onClick={handleDecline}
                className={`flex! items-center! gap-1.5! px-4! py-2! rounded-full! text-sm! font-semibold! border! transition-all! cursor-pointer! ${
                  rsvpStatus === "declined"
                    ? "bg-rose-500! border-rose-500! text-white!"
                    : "border-slate-200! dark:border-slate-700! text-slate-600! dark:text-zinc-400! hover:bg-rose-50! dark:hover:bg-rose-950/20! hover:border-rose-300! hover:text-rose-500!"
                }`}
              >
                <XCircle size={15} />
                <span>Отклонить</span>
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className={`flex! items-center! gap-1.5! px-4! py-2! rounded-full! text-sm! font-semibold! border! transition-all! cursor-pointer! ${
                  rsvpStatus === "accepted"
                    ? `bg-gradient-to-r! ${theme.gradient} border-transparent! text-white!`
                    : "border-slate-200! dark:border-slate-700! text-slate-600! dark:text-zinc-400! hover:bg-emerald-50! dark:hover:bg-emerald-950/20! hover:border-emerald-300! hover:text-emerald-600!"
                }`}
              >
                <Check size={15} />
                <span>Принять</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </If>
  );
});
