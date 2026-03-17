import api from './api';

export interface PostUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  createdAt: string;
  user: PostUser;
}

export const fetchPosts = async (page = 1, limit = 10) => {
  const response = await api.get('/posts', { params: { page, limit } });
  return response.data.data as { posts: Post[]; pagination: any };
};

export const createPost = async (content: string, file?: File) => {
  const formData = new FormData();
  formData.append('content', content);
  if (file) {
    formData.append('media', file);
  }

  const response = await api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.data as Post;
};

export const fetchUserPosts = async (userId: string, page = 1, limit = 10) => {
  const response = await api.get(`/posts/user/${userId}`, { params: { page, limit } });
  return response.data.data as { posts: Post[]; pagination: any };
};

export const deletePost = async (id: string) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};
