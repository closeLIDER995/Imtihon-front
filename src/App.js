import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './Page/NotificationContex';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Feed from './Page/Feed';
import Profile from './Page/Profile';
import Post from './Page/Post';
import Users from './Page/Users';
import Notifications from './Page/Notifications';
import AuthForm from './Components/AuthForm';
import AdminPage from './Page/Admin';

import { ThemeProvider } from './Context/ThemeContext';

import ThemeToggle from './ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <ToastContainer autoClose={10000} />
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/home" element={<Feed />} />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/post" element={<Post />} />
            <Route path="/users" element={<Users />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
