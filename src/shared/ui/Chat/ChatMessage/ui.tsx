import React from 'react';
import './style.css';
import { If } from '../../If';

interface IReplyContext {
  author: string;
  text: string;
}

interface ChatMessageProps {
  author: string;
  text: string;
  time: string;
  isMine?: boolean;
  replyTo?: IReplyContext;
  onReplyClick?: () => void;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  author,
  text,
  time,
  isMine = false,
  replyTo,
  onReplyClick,
  className = '',
}) => {
  return (
    <div 
      className={`chat-msg ${isMine ? 'chat-msg--mine' : ''} ${className}`}
      onClick={onReplyClick}
    >
      <div className="chat-msg__body">
        <If is={!isMine}>
          <div className="chat-msg__author">{author}</div>
        </If>

        <If is={replyTo}>
          <div className="chat-msg__reply-context">
            <div className="chat-msg__reply-author">{replyTo?.author}</div>
            <div className="chat-msg__reply-text">{replyTo?.text}</div>
          </div>
        </If>

        <div className="chat-msg__text">{text}</div>
        <div className="chat-msg__time">{time}</div>
      </div>
    </div>
  );
};
