// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getNotifications } from '../api/notificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId || !token) return;

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

    const sock = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });

    setSocket(sock);

    // Serverga ulanishda userni ulab qo‘yish
    sock.on('connect', () => {
      console.log('Socket connected:', sock.id);
      sock.emit('join', userId);
    });

    // Yangi bildirishnoma kelganda
    sock.on('newNotification', (notification) => {
      setNotifications(prev => {
        if (!prev.some(n => n._id === notification._id)) {
          return [notification, ...prev];
        }
        return prev;
      });
    });

    // Bildirishnoma o'qildi
    sock.on('notificationUpdated', ({ notificationId, isRead }) => {
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead } : n
        )
      );
    });

    // Boshlang‘ich bildirishnomalarni yuklash
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications(userId, token);
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Bildirishnomalarni olishda xatolik:', err);
        setNotifications([]);
      }
    };

    fetchNotifications();

    // Tozalash (component unmount bo‘lganda)
    return () => {
      sock.disconnect();
      console.log('Socket disconnected');
    };
  }, [userId, token]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, socket }}>
      {children}
    </NotificationContext.Provider>
  );
};
