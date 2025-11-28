import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Resolve the API base URL.
 * Priority:
 * 1) If REACT_APP_API_BASE is defined, use it.
 * 2) If running on CRA dev server (port 3000), use relative path to leverage proxy.
 * 3) Otherwise, fallback to http://localhost:3001.
 */
const getApiBase = () => {
  // 1) Explicit override via env
  const envBase = process.env.REACT_APP_API_BASE;
  if (envBase && typeof envBase === 'string' && envBase.trim() !== '') {
    return envBase.trim().replace(/\/+$/, ''); // sanitize trailing slashes
  }

  // 2) CRA dev server proxy use-case
  const isCRADev =
    typeof window !== 'undefined' &&
    window.location &&
    window.location.port === '3000';

  if (isCRADev) {
    return ''; // relative path - proxy will forward to backend
  }

  // 3) Fallback for non-proxy contexts
  return 'http://localhost:3001';
};

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply theme to root element for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch welcome message on mount
  useEffect(() => {
    let isMounted = true;

    const fetchMessage = async () => {
      setLoading(true);
      setError('');
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/api/welcome`, {
          headers: { 'Accept': 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        // Try JSON first; allow plain text as a fallback
        let text;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          text = data?.message ?? JSON.stringify(data);
        } else {
          text = await res.text();
        }

        if (isMounted) {
          setMessage(text || 'Welcome');
        }
      } catch (e) {
        if (isMounted) {
          setError(e?.message || 'Failed to load message');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessage();

    return () => {
      isMounted = false;
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div className="card">
          <div className="card-accent" aria-hidden="true" />
          <h1 className="title">Welcome</h1>
          <p className="subtitle">Ocean Professional</p>

          <div className="content">
            {loading && <p className="muted">Fetching your greeting...</p>}
            {!loading && error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {!loading && !error && (
              <p className="message" data-testid="welcome-message">
                {message}
              </p>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
