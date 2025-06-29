import React, { useContext } from 'react';
import { ThemeContext } from './Context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme} style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 2000,
      padding: '8px 14px',
      background: theme === 'light' ? '#333' : '#eee',
      color: theme === 'light' ? '#fff' : '#111',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      width: '80px',
      marginTop: '23px'
      
    }}>
      {theme === 'light' ? '🌙' : '🌞'}
    </button>
  );
};

export default ThemeToggle;
