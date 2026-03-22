import api from './api';

export interface ChatSummary {
  id: string;
  name: string;
  type: 'DIRECT' | 'GROUP';
  participants: Array<{ id: string; name: string; avatar?: string }>;
  lastMessage?: {
    content: string;
    sender: string;
    time: string;
  };
  unreadCount?: number;
  createdBy?: string; // ID of user who created the group
}

export interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  sender: { id: string; name: string; avatar?: string };
  createdAt: string;
}

export const fetchChats = async (): Promise<ChatSummary[]> => {
  const response = await api.get('/chats');
  return response.data.data as ChatSummary[];
};

export const fetchChatMessages = async (chatId: string, page = 1, limit = 50): Promise<{ messages: Message[] }> => {
  const response = await api.get(`/chats/${chatId}/messages`, { params: { page, limit } });
  return response.data.data as { messages: Message[] };
};

export const sendChatMessage = async (chatId: string, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') => {
  const response = await api.post(`/chats/${chatId}/messages`, { content, type });
  return response.data.data as Message;
};

export const createChat = async (participantIds: string[], name?: string, type: 'DIRECT' | 'GROUP' = 'DIRECT') => {
  const response = await api.post('/chats', { participantIds, name, type });
  return response.data.data as ChatSummary;
};

export const createGroup = async (name: string, participantIds: string[]) => {
  const response = await api.post('/chats', { name, participantIds, type: 'GROUP' });
  return response.data.data as ChatSummary;
};

export const deleteGroup = async (chatId: string) => {
  const response = await api.delete(`/chats/${chatId}`);
  return response.data;
};

export const kickUser = async (chatId: string, userId: string) => {
  const response = await api.delete(`/chats/${chatId}/participants/${userId}`);
  return response.data;
};

export const muteUser = async (chatId: string, userId: string) => {
  const response = await api.post(`/chats/${chatId}/mute`, { userId });
  return response.data;
};

export const unmuteUser = async (chatId: string, userId: string) => {
  const response = await api.delete(`/chats/${chatId}/mute/${userId}`);
  return response.data;
};
