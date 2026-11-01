'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import StatusPill from '@/components/StatusPill';
import { api } from '@/lib/client';
import { STATUSES, ACTIVE_STATUSES, OPTION_TYPES } from '@/lib/constants';
import { dateRange } from '@/lib/format';

export default function Dashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Active');
  const [query, setQuery] = useState('');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    api('/api/bookings')
      .then((d) => setBookings(d.bookings))
      .catch((e) => setError(e.message));
  }, []);

  const counts = useMemo(() => {
    const c = { Active: 0, All: 0 };
    for (const s of STATUSES) c[s] = 0;
    for (const b of bookings || []) {
      c.All++;
      c[b.status] = (c[b.status] || 0) + 1;
      if (ACTIVE_STATUSES.includes(b.status)) c.Active++;
    }
    return c;
  }, [bookings]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (bookings || []).filter((b) => {
      if (filter === 'Active' && !ACTIVE_STATUSES.includes(b.status)) return false;
      if (filter !== 'Active' && filter !== 'All' && b.status !== filter) return false;
      if (q && !`${b.name} ${b.summary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [bookings, filter, query]);

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <div>
            <h1 className="serif">Holiday bookings</h1>
            <p className="muted">
              {bookings ? `${counts.Active} open job${counts.Active === 1 ? '' : 's'}` : 'Loading…'}
            </p>
          </div>
          <button className="btn primary" onClick={() => setShowNew(true)}>
            + New booking
          </button>
        </div>

        {showNew && (
          <NewBookingForm
            onCancel={() => setShowNew(false)}
            onCreated={(b) => router.push(`/bookings/${b.id}`)}
          />
        )}

        <div className="filters">
          {['Active', ...STATUSES, 'All'].map((f) => (
            <button key={f} className={'chip' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>
              {f === 'Active' ? 'Open jobs' : f} <span className="chip-n">{counts[f] || 0}</span>
            </button>
          ))}
        </div>

        {bookings && bookings.length > 0 && (
          <input
            className="search"
            type="search"
            placeholder="Search by name or request…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        {error && <p className="error">{error}</p>}

        {bookings && visible.length === 0 && (
          <div className="empty card">
            {bookings.length === 0 ? (
              <>
                <p className="serif big">No bookings yet</p>
                <p className="muted">Add your first holiday request to get started.</p>
                <button className="btn primary" onClick={() => setShowNew(true)}>
                  + New booking
                </button>
              </>
            ) : (
              <p className="muted">Nothing matches this filter.</p>
            )}
          </div>
        )}

        <ul className="booking-list">
          {visible.map((b) => (
            <li key={b.id}>
              <Link href={`/bookings/${b.id}`} className="card booking-row">
                <div className="row-top">
                  <span className="row-name">{b.name}</span>
                  <StatusPill status={b.status} />
                </div>
                {b.summary && <p className="row-summary">{b.summary}</p>}
                <div className="row-meta">
                  {(b.startDate || b.endDate) && <span>📅 {dateRange(b.startDate, b.endDate)}</span>}
                  <span>
                    {OPTION_TYPES.map((t) => {
                      const n = (b.options || []).filter((o) => o.type === t.key).length;
                      return n ? (
                        <span key={t.key} className="type-count" title={t.key}>
                          {t.emoji} {n}
                        </span>
                      ) : null;
                    })}
                    {!(b.options || []).length && <span className="faint">No options yet</span>}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

function NewBookingForm({ onCancel, onCreated }) {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { booking } = await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ name, summary, startDate, endDate }),
      });
      onCreated(booking);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="card form new-booking" onSubmit={submit}>
      <h2 className="serif">New booking</h2>
      <label className="field">
        <span>Client name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Thomson" required autoFocus />
      </label>
      <label className="field">
        <span>Holiday request</span>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="e.g. Family of 4 (kids 6 & 9), one week in the Alps, Easter, ~£6k"
        />
      </label>
      <div className="two">
        <label className="field">
          <span>Holiday start (optional)</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="field">
          <span>Holiday end (optional)</span>
          <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy}>
          {busy ? 'Saving…' : 'Create booking'}
        </button>
      </div>
    </form>
  );
}
