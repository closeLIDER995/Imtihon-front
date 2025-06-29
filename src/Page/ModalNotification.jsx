import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const NotificationModal = ({ notification, onClose }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const senderId = notification?.senderId?._id || notification?.senderId;
    if (senderId) {
      navigate(`/profile/${senderId}`);
      onClose();
    } else {
      alert('An error occurred while switching profiles. Sender ID not found.');
    }
  };

  const username =
    notification?.senderId?.username ||
    notification?.senderUsername ||
    (typeof notification?.senderId === "string" ? notification.senderId : null) ||
    "Users";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bg-light" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title text-center">Xabarlar</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <p>
            <strong>Turi:</strong> {notification?.type || 'Unknown'}
          </p>
          <p>
            <strong>Xabar:</strong> {notification?.message || 'No message'}
          </p>
          <p>
            <strong>Kimdan:</strong> {username}
          </p>
          <p>
            <strong>Vaqt:</strong>{' '}
            {notification?.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : 'Unknown time'}
          </p>
          {notification?.postId && notification.postId.content ? (
            <div>
              <p><strong>Post:</strong></p>
              <img
                src={notification.postId.postImage?.url || ''}
                alt="Post"
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <p>{notification.postId.content}</p>
            </div>
          ) : notification?.type === 'follow' ? (
            <p><strong>Post:</strong> No</p>
          ) : (
            <p><strong>Post:</strong> Post not found</p>
          )}
          <button className="btn btn-primary mt-3" onClick={handleProfileClick}>
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;