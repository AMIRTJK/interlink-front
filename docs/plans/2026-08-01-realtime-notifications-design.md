# Realtime-уведомления через Laravel Reverb

## Проблема

Новые письма, приглашения на согласование/подпись, поручения, задачи, встречи и
доступы к файлам появлялись в интерфейсе только после перезагрузки страницы или
по таймеру (`refetchInterval` у счётчика уведомлений — раз в минуту). Бэкенд
поднял Laravel Reverb и вещает событие `.user.notification` в приватный канал
`user.{id}`.

## Решение

WebSocket-событие — **сигнал об изменении**, а не источник данных. По событию
инвалидируются существующие ключи TanStack Query, и актуальные данные приходят
обычными REST-запросами. Никакого параллельного стора и ручной склейки списков.

## Изменения по файлам

### Конфигурация

- `.env` — `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`,
  `VITE_REVERB_SCHEME`. `REVERB_APP_SECRET` на фронт не передаётся.
- `src/shared/types/env.d.ts` — типы новых переменных.
- `src/shared/config/realtime.ts` — `REVERB_CONFIG` со статическим чтением
  `import.meta.env` и флагом `isEnabled`: без ключа/хоста realtime молча
  выключается, приложение работает как раньше.
- `src/shared/api/api-routes.ts` — `BROADCASTING_AUTH`.

### Инфраструктура

- `src/shared/lib/realtime/echoClient.ts` — `createEcho(accessToken)` и
  `getUserChannelName(userId)`. `laravel-echo` и `pusher-js` подключаются
  динамическим `import()`: они нужны только авторизованному пользователю и не
  должны лежать в стартовом бандле. Pusher-клиент передаётся опцией `Pusher`,
  без глобального `window.Pusher`.

### Домен уведомлений

- `features/notifications/model.ts` — union `NotificationType` дополнен всеми
  типами бэкенда, `INotificationData` — полями `correspondence_id`,
  `assignment_id`, `folder_id`, `file_id`, `due_date`, `start_at`, `end_at`;
  добавлен тип полезной нагрузки события `IRealtimeNotification`.
- `features/notifications/lib/realtimeKeys.ts` — чистая функция
  `getRealtimeInvalidateKeys(type)`: тип события → ключи кэша. Всегда
  обновляются `NOTIFICATIONS` и `NOTIFICATIONS_COUNTERS`; по префиксу типа
  добавляются реестры корреспонденции (`CORRESPONDENCE_INVALIDATE_KEYS`,
  включая `internal-correspondences/counters`, inbox, sent, to-sign, to-approve,
  processed), задачи, личные задачи, встречи или «Мои файлы».
- `features/notifications/api/useRealtimeNotifications.ts` — подписка на
  `user.{id}`, тост с заголовком уведомления, инвалидация ключей, отписка
  (`leave` + `disconnect`) при размонтировании и смене пользователя/токена.
- `features/notifications/lib/meta.tsx` — иконки для новых типов.

### Точка монтирования

- `app/providers/RealtimeNotifications.tsx` — компонент без разметки, вызывает
  хук ровно один раз внутри `QueryClientProvider`.
- `app/App.tsx` — монтирование.

## Верификация

1. Заполнить `VITE_REVERB_APP_KEY` значением `REVERB_APP_KEY` из `.env` бэкенда.
2. DevTools → Network → WS: соединение отвечает `101 Switching Protocols`.
3. Подписка на канал вызывает `POST /api/v1/broadcasting/auth` с Bearer-токеном.
4. От другого пользователя отправить письмо: получатель видит тост, счётчик на
   колокольчике и активный реестр обновляются без перезагрузки.
