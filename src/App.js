import React, { useState, useEffect } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import AuthPage from './components/AuthPage';
import AuthService from './services/AuthService';
import { LuSun, LuMoon, LuChevronDown, LuLogOut, LuUser } from 'react-icons/lu';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('light');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: '', role: 'User' });

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = () => {
      const authStatus = AuthService.isAuthenticated();
      setIsAuthenticated(authStatus);

      // Get user info from AuthService or storage
      if (authStatus) {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          setUser({
            name: currentUser.username || currentUser.name || currentUser.email || 'User',
            role: currentUser.role || 'User'
          });
        }
      }
    };

    // Initialize theme
    const initTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

      const initialTheme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');
      setTheme(initialTheme);

      // Apply theme class to body instead of data attribute to match CSS
      if (initialTheme === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    };

    checkAuthStatus();
    initTheme();
  }, []);

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);

    // Set user data after successful authentication
    if (userData) {
      setUser({
        name: userData.name || userData.username || userData.email || 'User',
        role: userData.role || 'User'
      });
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUserMenuOpen(false);
    setUser({ name: '', role: 'User' });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    // Update body class to match CSS
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    localStorage.setItem('theme', newTheme);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <div className="header-branding">
            <div className="logo-container">
              <div className="logo-icon"></div>
              <h1>Taskify</h1>
            </div>
            <p className="tagline">Simplify life, one task at a time.</p>
          </div>

          {isAuthenticated ? (
            <div className="user-profile">
              <button
                className="theme-toggle-button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <LuSun /> : <LuMoon />}
              </button>

              <div className="user-dropdown" onClick={toggleUserMenu}>
                <div className="user-avatar">
                  <LuUser />
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <LuChevronDown className={`dropdown-icon ${userMenuOpen ? 'open' : ''}`} />
              </div>

              {userMenuOpen && (
                <div className="user-menu">
                  <button onClick={handleLogout} className="logout-button">
                    <LuLogOut /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="theme-toggle-button auth-theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <LuSun /> : <LuMoon />}
            </button>
          )}
        </div>
      </header>

      <main>
        {isAuthenticated ? (
          <TodoList />
        ) : (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}
      </main>

      <footer className="App-footer">
        <p>© 2025 Taskify - Turn thoughts into actions</p>
      </footer>
    </div>
  );
}

export default App;