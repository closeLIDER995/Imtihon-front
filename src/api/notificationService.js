import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export const getNotifications = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/notification/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const readNotification = (id, token) => {
  return axios.patch(
    `http://localhost:4000/api/notification/${id}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const deleteNotification = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/notification/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteAllNotifications = async (userId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/notification/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (err) {
    throw err;
  }
};