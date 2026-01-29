import React, { useState } from 'react';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { If } from '../../If';
import './style.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  replyingTo?: { author: string; text: string } | null;
  onCancelReply?: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  replyingTo,
  onCancelReply,
  placeholder = "Напишите сообщение...",
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <If is={replyingTo}>
        <div className="chat-input__reply-preview">
          <div className="chat-input__reply-content">
            <div className="chat-input__reply-author">{replyingTo?.author}</div>
            <div className="chat-input__reply-text">{replyingTo?.text}</div>
          </div>
          <Button 
            type="text" 
            size="small" 
            icon={<CloseOutlined style={{ fontSize: 12 }} />} 
            onClick={onCancelReply}
            className="chat-input__reply-close"
          />
        </div>
      </If>

      <div className="chat-input">
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chat-input__textarea"
        />
        <button 
          className="chat-input__send-btn" 
          onClick={handleSend}
          disabled={!text.trim()}
        >
          <SendOutlined />
        </button>
      </div>
    </div>
  );
};
