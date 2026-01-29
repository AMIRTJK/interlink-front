import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage, ChatInput, Loader } from '@shared/ui';
import { useGetQuery, useMutationQuery } from '@shared/lib/hooks';
import { ApiRoutes } from '@shared/api';
import './style.css';

interface IMessage {
  id: string;
  author: string;
  text: string;
  time: string;
  isMine: boolean;
  replyTo?: { author: string; text: string };
}

interface IChatResponse {
  messages: IMessage[];
}

interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ChatViewProps {
  contextId?: string;
  className?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ contextId = 'test-id', className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeReply, setActiveReply] = useState<IMessage | null>(null);

  // Тестовый эндпоинт для получения сообщений
  const messagesUrl = `${ApiRoutes.GET_CORRESPONDENCES}/${contextId}/messages`;

  const { data, isLoading, refetch } = useGetQuery<Record<string, unknown>, IApiResponse<IChatResponse>>({
    url: messagesUrl,
    useToken: true,
    options: {
      enabled: !!contextId,
      // Тестовые данные для демонстрации функционала
      initialData: {
        success: true,
        message: 'Success',
        data: {
          messages: [
            {
              id: '1',
              author: 'Иванов И.И.',
              text: 'Добрый день! Подготовил отчет по вашему запросу.',
              time: '10:30',
              isMine: false,
            },
            {
              id: '2',
              author: 'Admin Super',
              text: 'Принято, сейчас посмотрю.',
              time: '10:35',
              isMine: true,
            },
          ]
        }
      }
    }
  });

  // Тестовая мутация для отправки сообщения
  const { mutate: sendMessage, isLoading: isSending } = useMutationQuery<Record<string, unknown>, IChatResponse>({
    url: messagesUrl,
    method: 'POST',
    messages: {
      success: 'Сообщение отправлено',
      error: 'Ошибка при отправке',
      onSuccessCb: () => {
        setActiveReply(null);
        refetch(); // Обновляем список сообщений после успешной отправки
      }
    }
  });

  const messages = useMemo(() => data?.data?.messages || [], [data]);

  // Авто-скролл вниз при появлении новых сообщений
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
    // Тестовые параметры запроса для API
    sendMessage({
      text,
      reply_to_id: activeReply?.id,
      context_id: contextId
    });
  };

  const handleReplyToMessage = (msg: IMessage) => {
    setActiveReply(msg);
  };

  return (
    <div className={`chat-view ${className}`}>
      <div className="chat-view__history" ref={scrollRef}>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          messages.map((msg: IMessage) => (
            <ChatMessage
              key={msg.id}
              author={msg.author}
              text={msg.text}
              time={msg.time}
              isMine={msg.isMine}
              replyTo={msg.replyTo}
              onReplyClick={() => handleReplyToMessage(msg)}
            />
          ))
        )}
      </div>

      <ChatInput
        onSend={handleSendMessage}
        replyingTo={activeReply}
        onCancelReply={() => setActiveReply(null)}
        placeholder={isSending ? "Отправка..." : "Напишите сообщение..."}
      />
    </div>
  );
};
