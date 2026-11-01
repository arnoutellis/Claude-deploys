'use client';

import Link from 'next/link';

export function Mountains({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 120 48" aria-hidden="true">
      <path d="M0 48 L34 10 L58 36 L70 24 L96 48 Z" fill="var(--blue-2)" />
      <path d="M30 48 L62 16 L94 48 Z" fill="var(--pink-2)" opacity="0.9" />
      <circle cx="98" cy="12" r="6" fill="var(--pink-2)" />
    </svg>
  );
}

export default function Header({ back, right }) {
  async function logout() {
    await fetch('/api/login', { method: 'DELETE' });
    window.location.href = '/login';
  }
  return (
    <header className="topbar">
      <div className="topbar-inner">
        {back ? (
          <Link href={back.href} className="back">
            ← {back.label}
          </Link>
        ) : (
          <Link href="/" className="brand">
            <Mountains className="brand-mark" />
            <span>
              <span className="brand-name">Travels with Ruthie</span>
              <span className="brand-sub">Quotes</span>
            </span>
          </Link>
        )}
        <div className="topbar-right">
          {right}
          {!back && (
            <button className="link-btn" onClick={logout}>
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
