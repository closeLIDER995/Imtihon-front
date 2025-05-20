import React, { useState } from 'react';
import NotificationModal from './Modal';
import './styles.css';

const Notification = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: '🔔',
      username: 'JohnDoe',
      message: 'liked your post.',
      time: '2 minutes ago',
    },
    {
      id: 2,
      icon: '❤️',
      username: 'JaneSmith',
      message: 'started following you.',
      time: '10 minutes ago',
    },
    {
      id: 3,
      icon: '🧹',
      username: 'TechGuru',
      message: 'commented on your post.',
      time: '1 hour ago',
    },
  ]);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const clearAll = () => {
    setNotifications([]);
    setSelectedNotification(null);
  };

  const deleteOne = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    setSelectedNotification(null);
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <div className="notification-box p-4 shadow rounded bg-white">
        {notifications.length === 0 ? (
          <p className="text-center text-muted no-notification">No notifications</p>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className="d-flex align-items-center justify-content-between p-3 border-bottom notification-item"
            >
              <div
                className="d-flex align-items-center flex-grow-1"
                onClick={() => setSelectedNotification(notif)}
              >
                <span className="icon-circle me-3">{notif.icon}</span>
                <div>
                  <strong>{notif.username}</strong> {notif.message}
                  <p className="text-muted mb-0">{notif.time}</p>
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline-danger btn-del"
                onClick={() => deleteOne(notif.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}

        {notifications.length > 0 && (
          <button
            className="btn btn-primary mt-3 w-100"
            onClick={clearAll}
          >
            Clear All Notifications
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
  );
};

export default Notification;
