import api from './api';

export interface ContactUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface ContactItem {
  id: string;
  user: ContactUser;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: string;
}

export interface ContactResponse {
  contacts: ContactItem[];
  pendingRequests: Array<{ id: string; user: ContactUser; createdAt: string }>;
}

export const fetchContacts = async (): Promise<ContactResponse> => {
  const response = await api.get('/contacts');
  return response.data.data as ContactResponse;
};

export const sendContactRequest = async (contactId: string) => {
  const response = await api.post('/contacts/request', { contactId });
  return response.data.data as ContactItem;
};

export const acceptContactRequest = async (requestId: string) => {
  const response = await api.post(`/contacts/accept/${requestId}`);
  return response.data.data as ContactItem;
};

export const rejectContactRequest = async (requestId: string) => {
  const response = await api.post(`/contacts/reject/${requestId}`);
  return response.data;
};

export const removeContact = async (contactId: string) => {
  const response = await api.delete(`/contacts/${contactId}`);
  return response.data;
};

export const searchUsers = async (query: string) => {
  const response = await api.get('/users/search', { params: { q: query } });
  return response.data.data as ContactUser[];
};
