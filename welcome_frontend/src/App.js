import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Resolve the API base URL.
 * - Uses relative path when CRA proxy is configured (optional).
 * - Falls back to absolute http://localhost:3001 for local dev when no proxy.
 */
const getApiBase = () => {
  // If running on same origin with a CRA proxy set, relative works.
  const useRelative =
    typeof window !== 'undefined' &&
    window.location &&
    window.location.port === '3000'; // typical CRA dev

  return useRelative ? '' : 'http://localhost:3001';
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
