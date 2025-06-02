import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationModal from './ModalNotification';
import { NotificationContext } from './NotificationContex';
import AppNavbar from '../Components/Navbar';
import {
  readNotification,
  deleteNotification,
  deleteAllNotifications
} from '../api/notificationService';
import './styles.css';

const Notifications = () => {
  const { notifications, setNotifications, socket } = useContext(NotificationContext);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const clearAll = async () => {
    if (window.confirm('Barcha bildirishnomalarni o‘chirishni xohlaysizmi?')) {
      try {
        await deleteAllNotifications(userId, token);
        setNotifications([]);
        setSelectedNotification(null);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/auth', { replace: true });
        }
      }
    }
  };

  const deleteOne = async (id) => {
    if (!window.confirm('Ushbu bildirishnomani o‘chirishni xohlaysizmi?')) return;
    try {
      await deleteNotification(id, token);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (selectedNotification?._id === id) setSelectedNotification(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/auth', { replace: true });
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await readNotification(id, token);
      if (response.status === 200) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        socket?.emit('notificationUpdated', { notificationId: id });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/auth', { replace: true });
      }
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    setSelectedNotification(notif);
  };

  const handleUsernameClick = (senderId, e) => {
    e.stopPropagation();
    navigate(`/profile/${senderId}`);
  };

  return (
    <>
      <AppNavbar />
      <div className="notif-container">
        <div className="notif-box">
          {notifications.length === 0 ? (
            <p className="notif-empty">Hozircha bildirishnomalar yo‘q</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notif-item ${notif.isRead ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="notif-content">
                  <span className="notif-icon">
                    {notif.type === 'follow' ? '❤️' : notif.type === 'comment' ? '💬' : '👍'}
                  </span>
                  <div className="notif-text">
                    <span
                      className="notif-username"
                      onClick={(e) => handleUsernameClick(notif.senderId?._id, e)}
                      style={{ cursor: 'pointer', color: '#007bff' }}
                    >
                      {notif.senderId?.username || 'Noma’lum'}
                    </span>{' '}
                    {notif.message}
                    <p className="notif-time">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  className="notif-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOne(notif._id);
                  }}
                >
                  O‘chirish
                </button>
              </div>
            ))
          )}
          {notifications.length > 0 && (
            <button className="notif-clear-btn" onClick={clearAll}>
              Barchasini O‘chirish
            </button>
          )}
        </div>

        {selectedNotification && (
          <NotificationModal
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
          />
        )}
      </div>
    </>
  );
};

export default Notifications;