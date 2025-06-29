import axios from 'axios';

const BASE_URL = process.env.REACT_APP_SERVER_URL || 'https://imtihon-backend-vu9t.onrender.com/api';

const API = axios.create({ baseURL: BASE_URL });

export const register = (formData) => API.post('/signup', formData);
export const login = (formData) => API.post('/login', formData);   