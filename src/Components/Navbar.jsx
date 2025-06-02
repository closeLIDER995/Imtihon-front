import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NotificationContext } from '../Page/NotificationContex';
import '../styles/Navbar.css';

const AppNavbar = () => {
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/auth', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className='container'>
        <div className="navbar-brand">
          <Link to="/home" className="logo" style={{ color: "white" }}>SocialApp</Link>
        </div>
        <div className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        <div className={`link-all ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active-link' : ''}`}>Home</Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active-link' : ''}`}>Profile</Link>
          <Link to="/post" className={`nav-link ${location.pathname === '/post' ? 'active-link' : ''}`}>Post</Link>
          <Link to="/users" className={`nav-link ${location.pathname === '/users' ? 'active-link' : ''}`}>Users</Link>
          <Link to="/notifications" className={`nav-link ${location.pathname === '/notifications' ? 'active-link' : ''}`}>
            Notifications
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </Link>
          {token && (
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;