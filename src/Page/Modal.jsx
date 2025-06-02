// import React, { useState } from 'react';
// import './styles.css';

// const NotificationModal = ({ notification, onClose }) => {
//   const [isFollowing, setIsFollowing] = useState(false);

//   const handleFollowToggle = () => {
//     setIsFollowing(!isFollowing);
//   };

//   return (
//     <div className="modal-overlay d-flex align-items-center justify-content-center">
//       <div className="modal-content bg-white p-4 rounded shadow position-relative">
//         <button className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose}></button>

//         <div className="text-center mb-3">
//           <div className="icon-circle big-circle mx-auto mb-2">{notification.icon}</div>
//           <h5 className="mb-0">{notification.username}</h5>
//         </div>

//         <p className="text-center w-50 m-auto">{notification.message}</p>
//         <small className="text-muted d-block text-center">{notification.time}</small>
//           <button
//             className={`btn btn-sm mt-2 w-50 m-auto ${isFollowing ? 'btn-outline-secondary' : 'btn-primary'}`}
//             onClick={handleFollowToggle}
//           >
//             {isFollowing ? 'Unfollow' : 'Follow'}
//           </button>
//       </div>
//     </div>
//   );
// };

// export default NotificationModal;
