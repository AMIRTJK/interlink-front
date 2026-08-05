import {
  useCallback,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { AuthorshipPopover } from "./AuthorshipPopover";
import { AUTHORSHIP_ATTR } from "./model";
import type { IAuthorshipFragment } from "./markAuthorship";

interface IHoverState {
  fragment: IAuthorshipFragment;
  x: number;
  y: number;
}

interface IProps {
  enabled: boolean;
  fragments: IAuthorshipFragment[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Обёртка холста, показывающая карточку автора при наведении на подсвеченный
 * фрагмент. Состояние ховера держим здесь, а не в родителе: оно меняется на
 * каждое движение мыши, и перерисовываться должна только эта колонка.
 */
export const AuthorshipHoverLayer = ({
  enabled,
  fragments,
  className,
  style,
  children,
}: IProps) => {
  const [hover, setHover] = useState<IHoverState | null>(null);

  const handlePointerOver = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = (event.target as HTMLElement | null)?.closest?.(
        `[${AUTHORSHIP_ATTR}]`,
      );

      if (!target) {
        // Ушли с подсветки на обычный текст — карточку убираем.
        setHover((prev) => (prev ? null : prev));
        return;
      }

      const fragment = fragments[Number(target.getAttribute(AUTHORSHIP_ATTR))];
      if (!fragment) return;

      const rect = target.getBoundingClientRect();
      setHover({ fragment, x: rect.left + rect.width / 2, y: rect.top });
    },
    [fragments],
  );

  const handlePointerLeave = useCallback(() => setHover(null), []);

  return (
    <>
      <div
        className={className}
        style={style}
        onPointerOver={enabled ? handlePointerOver : undefined}
        onPointerLeave={enabled ? handlePointerLeave : undefined}
      >
        {children}
      </div>

      {enabled && hover && (
        <AuthorshipPopover
          fragment={hover.fragment}
          x={hover.x}
          y={hover.y}
        />
      )}
    </>
  );
};
