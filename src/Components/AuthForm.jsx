import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api/authRequest'; // import qiling

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    surname: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = isSignup
        ? await register(formData)
        : await login(formData);

      if (data.success) {
        navigate('/home');
      } else {
        alert(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error(error);
      alert('Server bilan ulanishda xatolik');
    }
  };

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
