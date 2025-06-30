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
    console.log("Yuborilgan formData:", formData);

    try {
      const response = isSignup
        ? await register(formData)
        : await login({ email: formData.email, password: formData.password });

      const data = response.data;

      if (data.token && data.userId && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId.toString());
        localStorage.setItem('role', data.user.role.toString());

        toast.success(isSignup ? 'Signup Success' : 'Login Success');
        navigate('/home', { replace: true });
      } else {
        setError(data.message || 'Serverdan noto‘g‘ri javob keldi.');
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || 'Serverga ulanishda xatolik');
      toast.error(error.response?.data?.message || 'Xatolik');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/home');
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
      <form onSubmit={handleSubmit} style={{
        padding: 30, borderRadius: 10, width: 300,
        background: 'linear-gradient(to top, black, purple)',
        color: '#fff'
      }}>
        <h3>{isSignup ? 'Signup' : 'Login'}</h3>

        {error && <p style={{ color: '#ffdddd' }}>{error}</p>}

        {isSignup && (
          <>
            <input type="text" name="username" placeholder="Username"
              onChange={handleChange} required style={inputStyle} />
            <input type="text" name="surname" placeholder="Surname"
              onChange={handleChange} required style={inputStyle} />
          </>
        )}

        <input type="email" name="email" placeholder="Email"
          onChange={handleChange} required style={inputStyle} />
        <input type="password" name="password" placeholder="Password"
          onChange={handleChange} required style={inputStyle} />

        <button type="submit" style={buttonStyle}>
          {isSignup ? 'Signup' : 'Login'}
        </button>

        <p style={{ marginTop: 10 }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsSignup(!isSignup)} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
            {isSignup ? 'Login' : 'Signup'}
          </span>
        </p>
      </form>
    </div>
  );
};

const inputStyle = {
  margin: '10px 0',
  padding: 10,
  width: '100%',
  borderRadius: 5,
  border: 'none'
};

const buttonStyle = {
  padding: 10,
  background: 'linear-gradient(to right, #0ea5e9, #3b82f6)',
  color: '#fff',
  border: 'none',
  borderRadius: 5,
  marginTop: 10,
  cursor: 'pointer',
  width: '100%'
};

export default AuthForm;
