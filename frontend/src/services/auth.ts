import api from './api';



export const refreshToken = async () => {

  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) return null;



  const response = await api.post('/auth/refresh', { refreshToken });

  if (response.data.success) {

    const { token, refreshToken: newRefreshToken } = response.data.data;

    localStorage.setItem('token', token);

    localStorage.setItem('refreshToken', newRefreshToken);

    return token;

  }



  return null;

};



export const logout = async () => {

  try {

    await api.post('/auth/logout');

  } catch (e) {

    // ignore

  }



  localStorage.removeItem('token');

  localStorage.removeItem('refreshToken');

};

