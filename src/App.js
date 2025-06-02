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

function App() {
  return (
    <NotificationProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={10000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/home" element={<Feed />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/post" element={<Post />} />
          <Route path="/users" element={<Users />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;