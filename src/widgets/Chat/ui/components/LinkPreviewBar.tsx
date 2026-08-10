import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, X } from "lucide-react";
import { useLinkPreview } from "../../api";
import { getUrlHost } from "../../lib/chatLinks";
import { Translations } from "../../lib/translations";

// Превью ссылки над полем ввода, как в Telegram: заголовок, описание и картинка
// страницы, если она их отдаёт.
//
// Состояния загрузки, ошибки и пустого ответа намеренно ничего не рисуют:
// превью — необязательное дополнение к сообщению, и мигающая под полем ввода
// заглушка мешала бы печатать. Отправку оно ни в каком состоянии не блокирует.

interface IProps {
  text: string;
  isDark: boolean;
  t: Translations;
}

export const LinkPreviewBar = ({ text, t }: IProps) => {
  const { url, preview } = useLinkPreview(text);
  const [dismissedUrl, setDismissedUrl] = useState<string | null>(null);

  if (!url || !preview || dismissedUrl === url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 mb-2 flex items-stretch gap-3 rounded-2xl px-3 py-2 border bg-[var(--th-accent-soft)] border-[var(--th-accent-border)] text-[var(--th-text)]"
    >
      <div className="w-1 rounded-full flex-shrink-0 bg-[var(--th-accent-text)]" />

      {preview.image && (
        <img
          src={preview.image}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 self-center"
        />
      )}

      <div className="flex-1 min-w-0 self-center">
        <p className="flex items-center gap-1 text-[10px] font-semibold text-[var(--th-accent-text)]">
          <Link2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{preview.site_name || getUrlHost(url)}</span>
        </p>
        <p className="text-xs font-semibold truncate">
          {preview.title || getUrlHost(url)}
        </p>
        {preview.description && (
          <p className="text-[11px] truncate text-[var(--th-text-muted)]">
            {preview.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setDismissedUrl(url)}
        aria-label={t.hideLinkPreview}
        className="w-6 h-6 rounded-full flex items-center justify-center self-center flex-shrink-0 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-faint)] hover:text-[var(--th-text)]"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
