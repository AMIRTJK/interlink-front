export type Lang = 'en' | 'ru' | 'tg';
export type Translations = {
  // Sidebar
  search: string;
  newMessage: string;
  newChat: string;
  activeNow: string;
  recentActive: string;
  myStory: string;
  // Header
  online: string;
  lastSeen: string;
  searchMessages: string;
  simulateCall: string;
  videoCall: string;
  audioCall: string;
  contactInfo: string;
  // Messages
  typing: string;
  pinned: string;
  pinnedMessage: string;
  forwarded: string;
  scheduled: string;
  youDeletedThis: string;
  messageDeleted: string;
  // Input
  typeMessage: string;
  scheduleMessage: string;
  recordVoice: string;
  aiSmartReply: string;
  // AI Panel
  aiSuggestions: string;
  generatingSuggestions: string;
  // Reply bar
  // Emoji
  smileys: string;
  gestures: string;
  hearts: string;
  nature: string;
  food: string;
  // Attachment
  filesReadyToSend: string;
  file: string;
  files: string;
  sendAll: string;
  // Voice
  // Call screen
  incomingVideo: string;
  incomingVoice: string;
  decline: string;
  accept: string;
  videoCallLabel: string;
  voiceCallLabel: string;
  // Contact drawer
  info: string;
  media: string;
  email: string;
  location: string;
  memberSince: string;
  mutualGroups: string;
  blockContact: string;
  deleteConversation: string;
  sharedMedia: string;
  sharedFiles: string;
  call: string;
  video: string;
  mute: string;
  star: string;
  // Delete modal
  deleteMessage: string;
  cannotBeUndone: string;
  deleteForMe: string;
  deleteForMeDesc: string;
  deleteForEveryone: string;
  deleteForEveryoneDesc: string;
  cancel: string;
  deletingForMe: string;
  deletingForEveryone: string;
  // Delete conversation modal
  deleteConversationTitle: string;
  deleteConversationDesc: string;
  deleteAll: string;
  shreddingConversation: string;
  // Thread
  thread: string;
  originalMessage: string;
  replyInThread: string;
  // Compose
  to: string;
  searchContacts: string;
  noContactsFound: string;
  // Forward
  forwardMessage: string;
  // Message search
  searchMessagesPlaceholder: string;
  results: string;
  // Schedule
  in1Hour: string;
  in3Hours: string;
  tomorrow9am: string;
  tomorrow6pm: string;
  monday9am: string;
  // Status bar
  groupBadge: string;
  // Story
  hoursAgo: string;
  // Tabs
  recent: string;
  contacts: string;
  add: string;
};
export const TRANSLATIONS: Record<Lang, Translations> = {
  en: {
    search: 'Search',
    newMessage: 'New Message',
    newChat: 'New Chat',
    activeNow: 'Active Now',
    recentActive: 'Recent Active Profile',
    myStory: 'My Story',
    online: 'Online',
    lastSeen: 'Last seen recently',
    searchMessages: 'Search Messages',
    simulateCall: 'Simulate Incoming Call',
    videoCall: 'Video Call',
    audioCall: 'Audio Call',
    contactInfo: 'Contact Info',
    typing: 'typing',
    pinned: 'Pinned',
    pinnedMessage: 'Pinned Message',
    forwarded: 'Forwarded',
    scheduled: 'Scheduled',
    youDeletedThis: 'You deleted this message.',
    messageDeleted: 'This message was deleted.',
    typeMessage: 'Type a message…',
    scheduleMessage: 'Schedule message',
    recordVoice: 'Record voice message',
    aiSmartReply: 'AI Smart Reply',
    aiSuggestions: 'AI Suggestions',
    generatingSuggestions: 'Generating smart replies…',
    smileys: 'Smileys',
    gestures: 'Gestures',
    hearts: 'Hearts',
    nature: 'Nature',
    food: 'Food',
    filesReadyToSend: 'file(s) ready to send',
    file: 'file',
    files: 'files',
    sendAll: 'Send All',
    incomingVideo: 'Incoming video call…',
    incomingVoice: 'Incoming voice call…',
    decline: 'Decline',
    accept: 'Accept',
    videoCallLabel: 'Video call',
    voiceCallLabel: 'Voice call',
    info: 'Info',
    media: 'Media',
    email: 'Email',
    location: 'Location',
    memberSince: 'Member since',
    mutualGroups: 'Mutual Groups',
    blockContact: 'Block contact',
    deleteConversation: 'Delete conversation',
    sharedMedia: 'Shared Media',
    sharedFiles: 'Shared Files',
    call: 'Call',
    video: 'Video',
    mute: 'Mute',
    star: 'Star',
    deleteMessage: 'Delete Message',
    cannotBeUndone: 'This action cannot be undone',
    deleteForMe: 'Delete for me',
    deleteForMeDesc: "Only you won't see this message",
    deleteForEveryone: 'Delete for everyone',
    deleteForEveryoneDesc: 'Everyone will see "message deleted"',
    cancel: 'Cancel',
    deletingForMe: 'Deleting for you…',
    deletingForEveryone: 'Deleting for everyone…',
    deleteConversationTitle: 'Delete Conversation',
    deleteConversationDesc: 'This will permanently delete all messages in your conversation with',
    deleteAll: 'Delete All',
    shreddingConversation: 'Shredding conversation…',
    thread: 'Thread',
    originalMessage: 'Original message',
    replyInThread: 'Reply in thread…',
    to: 'To',
    searchContacts: 'Search contacts…',
    noContactsFound: 'No contacts found',
    forwardMessage: 'Forward Message',
    searchMessagesPlaceholder: 'Search messages…',
    results: 'results',
    in1Hour: 'In 1 hour',
    in3Hours: 'In 3 hours',
    tomorrow9am: 'Tomorrow 9 AM',
    tomorrow6pm: 'Tomorrow 6 PM',
    monday9am: 'Monday 9 AM',
    groupBadge: 'GROUP',
    hoursAgo: '2h ago',
    recent: 'Recent',
    contacts: 'Contacts',
    add: 'Add'
  },
  ru: {
    search: 'Поиск',
    newMessage: 'Новое сообщение',
    newChat: 'Новый чат',
    activeNow: 'Сейчас в сети',
    recentActive: 'Недавно активные',
    myStory: 'Мой статус',
    online: 'В сети',
    lastSeen: 'Недавно был(а) в сети',
    searchMessages: 'Поиск сообщений',
    simulateCall: 'Входящий звонок',
    videoCall: 'Видеозвонок',
    audioCall: 'Аудиозвонок',
    contactInfo: 'Информация',
    typing: 'печатает',
    pinned: 'Закреплено',
    pinnedMessage: 'Закреплённое сообщение',
    forwarded: 'Пересланное',
    scheduled: 'Запланировано',
    youDeletedThis: 'Вы удалили это сообщение.',
    messageDeleted: 'Сообщение удалено.',
    typeMessage: 'Написать сообщение…',
    scheduleMessage: 'Запланировать',
    recordVoice: 'Голосовое сообщение',
    aiSmartReply: 'ИИ-ответ',
    aiSuggestions: 'Предложения ИИ',
    generatingSuggestions: 'Генерируем умные ответы…',
    smileys: 'Смайлы',
    gestures: 'Жесты',
    hearts: 'Сердца',
    nature: 'Природа',
    food: 'Еда',
    filesReadyToSend: 'файл(ов) готово к отправке',
    file: 'файл',
    files: 'файлов',
    sendAll: 'Отправить всё',
    incomingVideo: 'Входящий видеозвонок…',
    incomingVoice: 'Входящий аудиозвонок…',
    decline: 'Отклонить',
    accept: 'Принять',
    videoCallLabel: 'Видеозвонок',
    voiceCallLabel: 'Аудиозвонок',
    info: 'Инфо',
    media: 'Медиа',
    email: 'Эл. почта',
    location: 'Местоположение',
    memberSince: 'В приложении с',
    mutualGroups: 'Общие группы',
    blockContact: 'Заблокировать',
    deleteConversation: 'Удалить переписку',
    sharedMedia: 'Медиафайлы',
    sharedFiles: 'Файлы',
    call: 'Звонок',
    video: 'Видео',
    mute: 'Без звука',
    star: 'Избранное',
    deleteMessage: 'Удалить сообщение',
    cannotBeUndone: 'Это действие нельзя отменить',
    deleteForMe: 'Удалить у меня',
    deleteForMeDesc: 'Только вы не будете видеть это сообщение',
    deleteForEveryone: 'Удалить у всех',
    deleteForEveryoneDesc: 'Все увидят «сообщение удалено»',
    cancel: 'Отмена',
    deletingForMe: 'Удаляем у вас…',
    deletingForEveryone: 'Удаляем у всех…',
    deleteConversationTitle: 'Удалить переписку',
    deleteConversationDesc: 'Все сообщения в переписке с',
    deleteAll: 'Удалить всё',
    shreddingConversation: 'Уничтожаем переписку…',
    thread: 'Ветка',
    originalMessage: 'Исходное сообщение',
    replyInThread: 'Ответить в ветке…',
    to: 'Кому',
    searchContacts: 'Поиск контактов…',
    noContactsFound: 'Контакты не найдены',
    forwardMessage: 'Переслать сообщение',
    searchMessagesPlaceholder: 'Поиск сообщений…',
    results: 'результатов',
    in1Hour: 'Через 1 час',
    in3Hours: 'Через 3 часа',
    tomorrow9am: 'Завтра в 9:00',
    tomorrow6pm: 'Завтра в 18:00',
    monday9am: 'В понедельник в 9:00',
    groupBadge: 'ГРУППА',
    hoursAgo: '2ч назад',
    recent: 'Последние',
    contacts: 'Контакты',
    add: 'Добавить'
  },
  tg: {
    search: 'Ҷустуҷӯ',
    newMessage: 'Паёми нав',
    newChat: 'Чати нав',
    activeNow: 'Ҳозир дар сабт',
    recentActive: 'Охирон фаъол',
    myStory: 'Ҳолати ман',
    online: 'Онлайн',
    lastSeen: 'Наздикан дида шуд',
    searchMessages: 'Ҷустуҷӯи паёмҳо',
    simulateCall: 'Занги воридшаванда',
    videoCall: 'Занги видеоӣ',
    audioCall: 'Занги овозӣ',
    contactInfo: 'Маълумот',
    typing: 'менависад',
    pinned: 'Мустаҳкам',
    pinnedMessage: 'Паёми мустаҳкам',
    forwarded: 'Пешфиристода',
    scheduled: 'Банақша',
    youDeletedThis: 'Шумо ин паёмро нест кардед.',
    messageDeleted: 'Паём нест карда шуд.',
    typeMessage: 'Паём нависед…',
    scheduleMessage: 'Банақша гузоштан',
    recordVoice: 'Паёми овозӣ',
    aiSmartReply: 'Ҷавоби зеҳни сунъӣ',
    aiSuggestions: 'Пешниҳодҳои ЗС',
    generatingSuggestions: 'Ҷавобҳои зирак тайёр мешаванд…',
    smileys: 'Смайлҳо',
    gestures: 'Ишораҳо',
    hearts: 'Дилҳо',
    nature: 'Табиат',
    food: 'Хӯрок',
    filesReadyToSend: 'файл барои фиристодан омода',
    file: 'файл',
    files: 'файлҳо',
    sendAll: 'Ҳама фиристед',
    incomingVideo: 'Занги видеоии воридшаванда…',
    incomingVoice: 'Занги овозии воридшаванда…',
    decline: 'Рад кардан',
    accept: 'Қабул кардан',
    videoCallLabel: 'Занги видеоӣ',
    voiceCallLabel: 'Занги овозӣ',
    info: 'Маълумот',
    media: 'Медиа',
    email: 'Почтаи эл.',
    location: 'Макон',
    memberSince: 'Узв аз',
    mutualGroups: 'Гурӯҳҳои умумӣ',
    blockContact: 'Манъ кардан',
    deleteConversation: 'Нест кардани суҳбат',
    sharedMedia: 'Медиафайлҳо',
    sharedFiles: 'Файлҳо',
    call: 'Занг',
    video: 'Видео',
    mute: 'Хомӯш',
    star: 'Дӯстдошта',
    deleteMessage: 'Нест кардани паём',
    cannotBeUndone: 'Ин амалро бозгардонидан мумкин нест',
    deleteForMe: 'Барои ман нест кун',
    deleteForMeDesc: 'Танҳо шумо ин паёмро намебинед',
    deleteForEveryone: 'Барои ҳама нест кун',
    deleteForEveryoneDesc: 'Ҳама «паём нест карда шуд» мебинанд',
    cancel: 'Бекор кардан',
    deletingForMe: 'Барои шумо нест мешавад…',
    deletingForEveryone: 'Барои ҳама нест мешавад…',
    deleteConversationTitle: 'Нест кардани суҳбат',
    deleteConversationDesc: 'Ҳамаи паёмҳои суҳбат бо',
    deleteAll: 'Ҳамаро нест кун',
    shreddingConversation: 'Суҳбат нест мешавад…',
    thread: 'Риштаи суҳбат',
    originalMessage: 'Паёми асл',
    replyInThread: 'Дар ришта ҷавоб диҳед…',
    to: 'Ба',
    searchContacts: 'Ҷустуҷӯи тамосҳо…',
    noContactsFound: 'Тамос ёфт нашуд',
    forwardMessage: 'Пешфиристодани паём',
    searchMessagesPlaceholder: 'Ҷустуҷӯи паёмҳо…',
    results: 'натиҷа',
    in1Hour: 'Баъди 1 соат',
    in3Hours: 'Баъди 3 соат',
    tomorrow9am: 'Фардо соати 9',
    tomorrow6pm: 'Фардо соати 18',
    monday9am: 'Душанбе соати 9',
    groupBadge: 'ГУРӮҲ',
    hoursAgo: '2с пеш',
    recent: 'Охирон',
    contacts: 'Тамосҳо',
    add: 'Илова'
  }
};