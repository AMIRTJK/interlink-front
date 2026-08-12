import React, { useEffect, useState } from "react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { IInternalComment } from "../api/useCorrespondenceComments";
import {
  formatCommentDate,
  getCommentInitials,
  resolveCommentPhotoUrl,
} from "../lib/comments";

interface IProps {
  comment: IInternalComment;
  isOwn: boolean;
}

export const CommentItem = React.memo(({ comment, isOwn }: IProps) => {
  const authorName = comment.user?.full_name || "Пользователь";
  const photoUrl = resolveCommentPhotoUrl(
    comment.user?.photo_url,
    comment.user?.photo_path,
  );

  // Бэкенд отдаёт photo_url и для отсутствующих на диске файлов (404),
  // поэтому при ошибке загрузки показываем инициалы.
  const [isPhotoFailed, setIsPhotoFailed] = useState(false);
  useEffect(() => {
    setIsPhotoFailed(false);
  }, [photoUrl]);

  const hasPhoto = Boolean(photoUrl) && !isPhotoFailed;

  return (
    <div
      className={cn(
        "flex gap-2.5 items-start p-3 rounded-xl border transition-colors",
        isOwn
          ? "bg-blue-50/60 hover:bg-blue-50 border-blue-100"
          : "bg-slate-50/70 hover:bg-slate-50 border-slate-100",
      )}
    >
      <If is={hasPhoto}>
        <img
          src={photoUrl}
          alt={authorName}
          width={28}
          height={28}
          loading="lazy"
          onError={() => setIsPhotoFailed(true)}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-2xs mt-0.5"
        />
      </If>
      <If is={!hasPhoto}>
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-2xs mt-0.5 text-white",
            isOwn ? "bg-blue-600" : "bg-indigo-600",
          )}
        >
          {getCommentInitials(authorName)}
        </div>
      </If>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-xs font-semibold text-slate-800 truncate">
            {authorName}
          </span>
          <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
            {formatCommentDate(comment.created_at)}
          </span>
        </div>
        <If is={Boolean(comment.user?.position)}>
          <p className="text-[10px] text-slate-400 truncate mb-1">
            {comment.user?.position}
          </p>
        </If>
        <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-pre-wrap">
          {comment.text}
        </p>
      </div>
    </div>
  );
});

CommentItem.displayName = "CommentItem";
