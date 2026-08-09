/**
 * Поиск ссылки в тексте сообщения. Нужен только первый адрес: превью, как в
 * Telegram, строится по нему одному, даже если ссылок в сообщении несколько.
 */
const URL_PATTERN = /(https?:\/\/|www\.)[^\s<>"']+/i;

/** Хвостовая пунктуация: точка или скобка после адреса — часть предложения. */
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

const countOf = (text: string, char: string) =>
  text.split(char).length - 1;

/**
 * Отрезает хвостовую пунктуацию. Закрывающая скобка — исключение: в адресах
 * вики она часть пути, поэтому возвращаем её, если внутри осталась незакрытая.
 */
const trimTail = (candidate: string) => {
  const trimmed = candidate.replace(TRAILING_PUNCTUATION, "");
  const isUnbalanced = countOf(trimmed, "(") > countOf(trimmed, ")");

  return isUnbalanced && candidate[trimmed.length] === ")"
    ? `${trimmed})`
    : trimmed;
};

export const extractFirstUrl = (text: string): string | null => {
  const match = text.match(URL_PATTERN);
  if (!match) return null;

  const raw = trimTail(match[0]);
  if (!raw) return null;

  const withScheme = raw.startsWith("www.") ? `https://${raw}` : raw;

  // Домен без точки — не адрес, а слово вроде «https://localhost»; такие в
  // превью не отдаём, чтобы не дёргать бэкенд впустую.
  try {
    const { hostname } = new URL(withScheme);
    return hostname.includes(".") ? withScheme : null;
  } catch {
    return null;
  }
};

/** Домен для подписи карточки, когда страница не отдала site_name. */
export const getUrlHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
