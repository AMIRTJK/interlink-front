import React from 'react';
import './style.css';

interface CommentCardProps {
  author: string;
  date: string;
  content: string;
  indicatorColor?: string;
  className?: string;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  author,
  date,
  content,
  indicatorColor = '#8C52FF',
  className = '',
}) => {
  return (
    <div className={`comment-card ${className}`}>
      <div 
        className="comment-card__indicator" 
        style={{ backgroundColor: indicatorColor }}
      />
      <div className="comment-card__body">
        <div className="comment-card__header">
          <span className="comment-card__author">{author}</span>
          <span className="comment-card__date">{date}</span>
        </div>
        <div className="comment-card__text">{content}</div>
      </div>
    </div>
  );
};
