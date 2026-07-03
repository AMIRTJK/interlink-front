import type { Contact, Message } from "./types";

// ─── Mock-данные чата ───────────────────────────────────────────────────────
// Единственный источник фейковых данных. Когда появится backend, эти массивы
// перестанут использоваться напрямую — их заменит реализация chatService.
const STORY_IMAGES = ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&q=80', 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&q=80'];
export const mockContacts: Contact[] = [{
  id: '1',
  name: 'Stephen Ramirez',
  avatar: 'https://i.pravatar.cc/150?img=12',
  lastMessage: 'Lorem ipsum is simply dummy..',
  online: true,
  unreadCount: 3,
  email: 'stephen.r@example.com',
  location: 'New York, USA',
  joined: 'March 2021',
  bio: 'Design enthusiast & coffee lover.',
  mutualGroups: ['Design Team', 'Friday Lunch'],
  story: STORY_IMAGES[0]
}, {
  id: '2',
  name: 'Mildred Peterson',
  avatar: 'https://i.pravatar.cc/150?img=47',
  lastMessage: 'Lorem ipsum is simply dummy..',
  online: true,
  unreadCount: 1,
  email: 'mildred.p@example.com',
  location: 'London, UK',
  joined: 'July 2020',
  bio: 'Product manager by day, baker by night.',
  mutualGroups: ['Product Squad'],
  story: STORY_IMAGES[1]
}, {
  id: '3',
  name: 'Patrick Gordon',
  avatar: 'https://i.pravatar.cc/150?img=33',
  lastMessage: 'Lorem ipsum is simply dummy..',
  online: false,
  email: 'patrick.g@example.com',
  location: 'Toronto, Canada',
  joined: 'January 2022',
  bio: 'Full-stack developer & open source contributor.',
  mutualGroups: ['Engineering', 'Hackathon 2023'],
  story: STORY_IMAGES[2]
}, {
  id: '4',
  name: 'Jerry Lawson',
  avatar: 'https://i.pravatar.cc/150?img=15',
  lastMessage: 'Lorem ipsum is simply dummy..',
  online: true,
  isGroup: true,
  unreadCount: 7,
  email: 'jerry.l@example.com',
  location: 'Austin, TX',
  joined: 'October 2019',
  bio: 'Marketing wizard & podcast host.',
  mutualGroups: ['Marketing', 'Friday Lunch'],
  story: STORY_IMAGES[3]
}, {
  id: '5',
  name: 'Jordan Day',
  avatar: 'https://i.pravatar.cc/150?img=8',
  lastMessage: 'Lorem ipsum is simply dummy..',
  online: false,
  recent: true,
  email: 'jordan.d@example.com',
  location: 'Seattle, WA',
  joined: 'May 2023',
  bio: 'UX researcher & illustrator.',
  mutualGroups: ['Design Team'],
  story: STORY_IMAGES[4]
}, {
  id: '6',
  name: 'Hannah Banks',
  avatar: 'https://i.pravatar.cc/150?img=45',
  lastMessage: 'Lorem ipsum is simply dummy..',
  online: true,
  recent: true,
  unreadCount: 2,
  email: 'hannah.b@example.com',
  location: 'Berlin, Germany',
  joined: 'February 2022',
  bio: 'Data scientist & yoga instructor.',
  mutualGroups: ['Data Crew', 'Yoga Club'],
  story: STORY_IMAGES[5]
}, {
  id: '7',
  name: 'Rachel Hoffman',
  avatar: 'https://i.pravatar.cc/150?img=48',
  lastMessage: 'Where does it come from?',
  online: true,
  email: 'rachel.h@example.com',
  location: 'San Francisco, CA',
  joined: 'November 2020',
  bio: 'Frontend engineer. React & animation geek.',
  mutualGroups: ['Engineering', 'Design Team', 'Hackathon 2023'],
  story: STORY_IMAGES[6]
}];
const initialMessages: Message[] = [{
  id: 'm1',
  senderId: '7',
  text: 'What is Lorem Ipsum dummy text?',
  time: '4:30 am'
}, {
  id: 'm2',
  senderId: 'me',
  text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown specimen book.",
  time: '4:35 am',
  status: 'read',
  reactions: [{
    emoji: '❤️',
    count: 1,
    reactedByMe: false
  }],
  pinned: true,
  threadCount: 2,
  threadMessages: [{
    id: 'm2-t1',
    senderId: '7',
    text: 'Great explanation!',
    time: '4:36 am'
  }, {
    id: 'm2-t2',
    senderId: 'me',
    text: 'Thanks! Glad it helped.',
    time: '4:37 am',
    status: 'read'
  }]
}, {
  id: 'm3',
  senderId: '7',
  text: 'Where does it come from?',
  time: '4:40 am'
}, {
  id: 'm4',
  senderId: 'me',
  text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown specimen book.",
  time: '5:03 am',
  status: 'read'
}, {
  id: 'm5',
  senderId: '7',
  text: 'Where does it come from?',
  time: '5:10 am'
}];
export const mockContactMessages: Record<string, Message[]> = {
  '7': initialMessages,
  '1': [{
    id: 'c1-m1',
    senderId: '1',
    text: 'Hey! Saw your latest design work — absolutely stunning!',
    time: '10:15 am'
  }, {
    id: 'c1-m2',
    senderId: 'me',
    text: 'Thank you so much! Been working hard on it.',
    time: '10:17 am',
    status: 'read'
  }, {
    id: 'c1-m3',
    senderId: '1',
    text: 'Could we sync up this week to discuss the new project?',
    time: '10:20 am'
  }],
  '2': [{
    id: 'c2-m1',
    senderId: '2',
    text: 'The product roadmap looks great. Just a few tweaks needed.',
    time: '9:00 am'
  }, {
    id: 'c2-m2',
    senderId: 'me',
    text: 'Sure, let me know what you need changed.',
    time: '9:05 am',
    status: 'read'
  }],
  '3': [{
    id: 'c3-m1',
    senderId: '3',
    text: 'Just pushed the new feature branch. Can you review?',
    time: '11:30 am'
  }, {
    id: 'c3-m2',
    senderId: 'me',
    text: "On it! I'll check it out shortly.",
    time: '11:32 am',
    status: 'sent'
  }, {
    id: 'c3-m3',
    senderId: '3',
    text: 'Also fixed that nasty bug in the auth flow.',
    time: '11:35 am'
  }],
  '4': [{
    id: 'c4-m1',
    senderId: '4',
    text: 'Campaign launch is next Monday. Are we all set?',
    time: '2:00 pm'
  }, {
    id: 'c4-m2',
    senderId: 'me',
    text: 'Yes, everything is ready on my end!',
    time: '2:03 pm',
    status: 'read'
  }],
  '5': [{
    id: 'c5-m1',
    senderId: '5',
    text: 'Finished the user research report. Sending it over!',
    time: '3:45 pm'
  }, {
    id: 'c5-m2',
    senderId: 'me',
    text: 'Perfect timing, thank you Jordan!',
    time: '3:47 pm',
    status: 'delivered'
  }],
  '6': [{
    id: 'c6-m1',
    senderId: '6',
    text: 'The data pipeline is running smoothly now 🎉',
    time: '8:30 am'
  }, {
    id: 'c6-m2',
    senderId: 'me',
    text: 'Great news! What was the issue in the end?',
    time: '8:33 am',
    status: 'read'
  }, {
    id: 'c6-m3',
    senderId: '6',
    text: 'A faulty transformation step. Fixed it this morning.',
    time: '8:35 am'
  }]
};
