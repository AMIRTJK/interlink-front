import { authorshipColorOf } from "./model";
import type { IAuthorshipLegendItem } from "./useAuthorship";

interface IProps {
  authors: IAuthorshipLegendItem[];
}

/** Кто есть кто по цветам подсветки — в шапке режима «Рецензирование». */
export const AuthorshipLegend = ({ authors }: IProps) => (
  <div className="flex items-center gap-3 flex-wrap min-w-0">
    {authors.map((author) => (
      <span key={author.id} className="flex items-center gap-1.5 min-w-0">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: authorshipColorOf(author.colorIndex).dot }}
        />
        <span className="text-[11px] font-medium text-slate-600 truncate max-w-[160px]">
          {author.name}
        </span>
      </span>
    ))}
  </div>
);
