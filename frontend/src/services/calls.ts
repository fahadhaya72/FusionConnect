import api from './api';

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  chatId?: string;
  type: 'VOICE' | 'VIDEO';
  status: 'RINGING' | 'CONNECTED' | 'ENDED' | 'MISSED';
  startTime: string;
  endTime?: string;
  roomId: string; // Made required since we're generating it
  createdAt: string;
  updatedAt: string;
  caller: {
    id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Create a new call
export const createCall = async (receiverId: string, type: 'VOICE' | 'VIDEO', chatId?: string) => {
  const response = await api.post('/calls', { receiverId, type, chatId });
  return response.data as Call;
};

// Get call details
export const getCall = async (callId: string) => {
  const response = await api.get(`/calls/${callId}`);
  return response.data as Call;
};

// Update call status
export const updateCallStatus = async (callId: string, status: 'CONNECTED' | 'ENDED' | 'MISSED') => {
  const response = await api.put(`/calls/${callId}/status`, { status });
  return response.data as Call;
};

// Get user's call history
export const getUserCalls = async (page = 1, limit = 20) => {
  const response = await api.get(`/calls/history?page=${page}&limit=${limit}`);
  return response.data;
};

// End call
export const endCall = async (callId: string) => {
  const response = await api.post(`/calls/${callId}/end`);
  return response.data as Call;
};
