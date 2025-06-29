import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, login } from '../api/authRequest';

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    surname: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = isSignup
        ? await register(formData)
        : await login(formData);

      const data = response.data;

      if (data && data.token && data.userId && data.user && typeof data.user.role !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId.toString());
        localStorage.setItem('role', data.user.role.toString()); // <-- ROLE ni ham saqlab qo‘yamiz

        toast.success(isSignup ? 'Signup Success' : 'Login Success', {
          position: "top-right",
          autoClose: 10000,
        });
        navigate('/home', { replace: true });
      } else {
        setError(data?.message || 'An incorrect response came from the server.');
        toast.error(isSignup ? 'Signup Denied' : 'Login Denied', {
          position: "top-right",
          autoClose: 10000,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Error connecting to the server');
      toast.error(isSignup ? 'Signup Denied' : 'Login Denied', {
        position: "top-right",
        autoClose: 10000,
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && token !== 'null' && userId && userId !== 'null') {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', }}>
      <form onSubmit={handleSubmit} style={{
        background: 'linear-gradient(to top,rgb(0, 0, 0),rgb(144, 0, 255))',
        padding: '30px',
        borderRadius: '15px',
        width: '300px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h3>{isSignup ? 'Signup' : 'Login'}</h3>

        {error && <p style={{ color: '', marginBottom: '10px' }}>{error}</p>}

        {isSignup && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              style={inputStyle}
              autoComplete="username"
            />
            <input
              type="text"
              name="surname"
              placeholder="Surname"
              onChange={handleChange}
              required
              style={inputStyle}
              autoComplete="family-name"
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={handleChange}
          required
          style={inputStyle}
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          onChange={handleChange}
          required
          style={inputStyle}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        <button type="submit" style={buttonStyle}>
          {isSignup ? 'Signup' : 'Login'}
        </button>

        <p style={{ marginTop: '10px', color: '#fff' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => setIsSignup(!isSignup)}
            style={{ color: '#ffffff', textDecoration: 'underline', cursor: 'pointer', }}
          >
            {isSignup ? 'Login' : 'Signup'}
          </span>
        </p>
      </form>
    </div>
  );
};

const inputStyle = {
  margin: '10px 0',
  padding: '10px',
  width: '100%',
  borderRadius: '5px',
  border: 'none'
};

const buttonStyle = {
  padding: '10px 20px',
  background: 'linear-gradient(to right, #0ea5e9, #3b82f6)',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  marginTop: '10px',
  cursor: 'pointer',
  width: '100%'
};

export default AuthForm;