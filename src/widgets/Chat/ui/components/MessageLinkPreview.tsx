import { useMemo } from "react";
import { Link2 } from "lucide-react";
import { useLinkPreview } from "../../api";
import { extractFirstUrl, getUrlHost } from "../../lib/chatLinks";
import { useInViewport } from "../../lib/useInViewport";
import { Translations } from "../../lib/translations";

// Карточка ссылки под сообщением. Запрос уходит только когда сообщение доехало
// до экрана: у ручки превью лимит 30 запросов в минуту, и открытая переписка
// с десятками ссылок выбрала бы его на первой же загрузке.
//
// Пока метаданных нет — не рисуем ничего, кроме метки для наблюдателя: пустая
// заглушка под каждым сообщением со ссылкой дёргала бы всю ленту, а часть
// страниц вообще не отдаёт ни заголовка, ни картинки.

interface IProps {
  text: string;
  isMe: boolean;
  t: Translations;
}

export const MessageLinkPreview = ({ text, isMe, t }: IProps) => {
  const url = useMemo(() => extractFirstUrl(text), [text]);
  const { ref, isVisible } = useInViewport<HTMLDivElement>();
  const { preview } = useLinkPreview(url, isVisible);

  if (!url) return null;

  if (!preview) return <div ref={ref} className="h-px w-full" />;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t.openLinkPreview}: ${preview.title || getUrlHost(url)}`}
      className={`mt-1 flex items-stretch gap-2.5 max-w-full rounded-2xl px-3 py-2 border no-underline transition-colors duration-200 ease-in-out bg-[var(--th-accent-soft)] border-[var(--th-accent-border)] hover:bg-[var(--th-accent-soft-strong)] text-[var(--th-text)] ${
        isMe ? "self-end" : "self-start"
      }`}
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
          <p className="text-[11px] line-clamp-2 text-[var(--th-text-muted)]">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
};
