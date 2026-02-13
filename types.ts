
export type CharacterId = 'omar' | 'salma' | 'youssef' | 'layla';

export interface User {
  username: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: number;
  messageCount: number;
}

export interface Message {
  id: string;
  sender: CharacterId | 'user';
  text: string;
  translatedText?: string;
  timestamp: number;
}

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  bio: string; // WhatsApp-style bio
  storySummary: string; // Life story summary
  accentColor: string;
  avatar: string;
  bioFragments: string[];
}

export interface ChatState {
  history: Message[];
  memory: string;
  lastDailyMessageTime: number;
}

export interface AppState {
  currentUser: User | null;
  activeCharacterId: CharacterId;
  chats: Record<CharacterId, ChatState>;
  language: 'ar' | 'en';
  isProfileOpen: boolean;
  isAdminDashboardOpen: boolean;
}
