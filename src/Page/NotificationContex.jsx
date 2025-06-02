import React, { createContext, useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import { getNotifications } from '../api/notificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Faqat o‘qilmaganlar soni
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (!userId || !token) return;

    const newSocket = io('http://localhost:4000', { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', userId);
    });

    // Yangi notification
    newSocket.on('newNotification', (notification) => {
      if (notification.receiverId?.toString() === userId) {
        setNotifications(prev => prev.some(n => n._id === notification._id)
          ? prev
          : [notification, ...prev]
        );
      }
    });

    // O‘qilgan notification
    newSocket.on('notificationUpdated', ({ notificationId }) => {
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    });

    // Dastlabki notificationlar
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications(userId, token);
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Fetch Notifications Error:', err);
      }
    };
    fetchNotifications();

    return () => {
      newSocket.off('newNotification');
      newSocket.off('notificationUpdated');
      newSocket.disconnect();
    };
  }, [userId, token]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, socket, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};