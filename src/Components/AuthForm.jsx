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

      console.log('Full response:', response);
      const data = response.data;

      if (data) {
        if (!data.token || !data.userId) {
          throw new Error('Token or userId missing in response');
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId.toString());
        console.log('Token and userId set:', { token: data.token, userId: data.userId });
        toast.success(isSignup ? 'Signup Success' : 'Login Success', {
          position: "top-right",
          autoClose: 10000,
        });
        navigate('/home', { replace: true });
      } else {
        setError(data?.message || 'Serverdan noto‘g‘ri javob keldi');
        toast.error(isSignup ? 'Signup Denied' : 'Login Denied', {
          position: "top-right",
          autoClose: 10000,
        });
      }
    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || error.message || 'Server bilan ulanishda xatolik');
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
      console.log('Token and userId found, navigating to /home');
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleSubmit} style={{
        background: 'linear-gradient(to top, #f43f5e, #ec4899)',
        padding: '30px',
        borderRadius: '15px',
        width: '300px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h3>{isSignup ? 'Signup' : 'Login'}</h3>

        {error && <p style={{ color: '#ff0000', marginBottom: '10px' }}>{error}</p>}

        {isSignup && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              type="text"
              name="surname"
              placeholder="Surname"
              onChange={handleChange}
              required
              style={inputStyle}
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
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          {isSignup ? 'Signup' : 'Login'}
        </button>

        <p style={{ marginTop: '10px', color: '#fff' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => setIsSignup(!isSignup)}
            style={{ color: '#000', textDecoration: 'underline', cursor: 'pointer' }}
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