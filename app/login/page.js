'use client';

import { useEffect, useState } from 'react';
import { Mountains } from '@/components/Header';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('/api/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (status && (!status.password || !status.storage)) {
    return (
      <main className="login">
        <div className="card login-card">
          <Mountains className="login-mark" />
          <h1 className="serif">Almost ready</h1>
          <p className="muted">This app still needs a little setup in Vercel:</p>
          <ul className="setup-list">
            <li className={status.password ? 'done' : ''}>
              {status.password ? '✓' : '○'} Password (APP_PASSWORD)
            </li>
            <li className={status.storage ? 'done' : ''}>
              {status.storage ? '✓' : '○'} Private Blob storage connected
            </li>
          </ul>
          <p className="muted small-print">After adding them, redeploy the project and refresh this page.</p>
        </div>
      </main>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = '/';
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Could not log in.');
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <form className="card login-card" onSubmit={submit}>
        <Mountains className="login-mark" />
        <h1 className="serif">Travels with Ruthie</h1>
        <p className="muted">Quotes & bookings</p>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary full" disabled={busy}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </main>
  );
}
