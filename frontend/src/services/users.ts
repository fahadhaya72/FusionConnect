import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  verified?: boolean;
  createdAt?: string;
  _count?: {
    posts?: number;
    contacts?: number;
  };
}

export const fetchProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data.data as UserProfile;
};

export const updateProfile = async (profile: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatar'>>) => {
  const response = await api.put('/users/profile', profile);
  return response.data.data as UserProfile;
};

export const searchUsers = async (query: string) => {
  const response = await api.get('/users/search', { params: { q: query } });
  return response.data.data as UserProfile[];
};

export const fetchUsers = async (page = 1, limit = 10) => {
  const response = await api.get('/users', { params: { page, limit } });
  return response.data.data as { users: UserProfile[]; pagination: any };
};
