import axios from 'axios';

const BASE_URL = 'https://imtihon-backend-vu9t.onrender.com'; // <-- .env dan olib kelishingiz ham mumkin

const API = axios.create({ baseURL: BASE_URL });

export const register = (formData) => API.post('/api/signup', formData);
export const login = (formData) => API.post('/api/login', formData);
