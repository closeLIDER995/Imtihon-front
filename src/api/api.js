import axios from 'axios';

const BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000/api';

export const getNotifications = () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  if (!userId || !token) {
    throw new Error('User ID or token is missing');
  }

  return axios.get(`${BASE_URL}/notification/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};