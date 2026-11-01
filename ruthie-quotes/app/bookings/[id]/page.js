'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { statusClass } from '@/components/StatusPill';
import useBooking from '@/components/useBooking';
import { api, newId } from '@/lib/client';
import { STATUSES, OPTION_TYPES, TYPE_BY_KEY } from '@/lib/constants';
import { dateRange, nightsText, fmtCost, optionDates } from '@/lib/format';

export default function BookingPage() {
  const router = useRouter();
  const { id, booking, error, saving, update } = useBooking();
  const [editingDetails, setEditingDetails] = useState(false);
  const [adding, setAdding] = useState(null); // option type key being added, or null
  const [editingOption, setEditingOption] = useState(null); // option id
  const [message, setMessage] = useState(null);

  if (!booking) {
    return (
      <>
        <Header back={{ href: '/', label: 'All bookings' }} />
        <main className="wrap">{error ? <p className="error">{error}</p> : <p className="muted">Loading…</p>}</main>
      </>
    );
  }

  const options = booking.options || [];
  const clientMessage = message ?? booking.clientMessage ?? '';

  async function saveOption(opt) {
    const exists = options.some((o) => o.id === opt.id);
    const next = exists ? options.map((o) => (o.id === opt.id ? opt : o)) : [...options, opt];
    await update({ options: next });
    setAdding(null);
    setEditingOption(null);
  }

  async function deleteOption(opt) {
    if (!confirm(`Delete this ${opt.type.toLowerCase()} option?`)) return;
    await update({ options: options.filter((o) => o.id !== opt.id) });
  }

  async function deleteBooking() {
    if (!confirm(`Delete the booking for ${booking.name}? This can't be undone.`)) return;
    await api(`/api/bookings/${id}`, { method: 'DELETE' });
    router.push('/');
  }

  return (
    <>
      <Header back={{ href: '/', label: 'All bookings' }} right={saving ? <span className="saving">Saving…</span> : null} />
      <main className="wrap">
        {error && <p className="error">{error}</p>}

        {/* ---------- Booking details ---------- */}
        {editingDetails ? (
          <DetailsForm
            booking={booking}
            onCancel={() => setEditingDetails(false)}
            onSave={async (changes) => {
              await update(changes);
              setEditingDetails(false);
            }}
          />
        ) : (
          <section className="card details">
            <div className="details-head">
              <h1 className="serif">{booking.name}</h1>
              <button className="btn ghost small" onClick={() => setEditingDetails(true)}>
                Edit
              </button>
            </div>
            {booking.summary ? <p className="summary">{booking.summary}</p> : <p className="faint">No request summary yet.</p>}
            <p className="dates">
              📅{' '}
              {booking.startDate || booking.endDate ? (
                <>
                  {dateRange(booking.startDate, booking.endDate)}
                  {nightsText(booking.startDate, booking.endDate) && (
                    <span className="muted"> · {nightsText(booking.startDate, booking.endDate)}</span>
                  )}
                </>
              ) : (
                <span className="faint">Holiday dates not set</span>
              )}
            </p>
            <label className="status-select">
              <span>Status</span>
              <select
                className={statusClass(booking.status)}
                value={booking.status}
                onChange={(e) => update({ status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </section>
        )}

        {/* ---------- Options ---------- */}
        <div className="section-head">
          <h2 className="serif">Holiday options</h2>
          <span className="muted">{options.length} total</span>
        </div>

        {OPTION_TYPES.map((t) => {
          const list = options.filter((o) => o.type === t.key);
          return (
            <section key={t.key} className="type-block">
              <div className="type-head">
                <h3>
                  <span className="type-emoji">{t.emoji}</span> {t.key}
                </h3>
                <button className="btn soft small" onClick={() => { setAdding(t.key); setEditingOption(null); }}>
                  + Add
                </button>
              </div>
              {list.map((o, i) =>
                editingOption === o.id ? (
                  <OptionForm key={o.id} initial={o} onCancel={() => setEditingOption(null)} onSave={saveOption} />
                ) : (
                  <article key={o.id} className="card option">
                    <div className="option-top">
                      <span className="option-label">Option {i + 1}</span>
                      <span className="option-cost">{fmtCost(o.cost)}</span>
                    </div>
                    {o.summary && <p className="option-summary">{o.summary}</p>}
                    {optionDates(o) && <p className="option-dates">{optionDates(o)}</p>}
                    <div className="option-actions">
                      <button className="link-btn" onClick={() => { setEditingOption(o.id); setAdding(null); }}>
                        Edit
                      </button>
                      <button className="link-btn danger" onClick={() => deleteOption(o)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ),
              )}
              {adding === t.key && (
                <OptionForm
                  initial={{ id: newId(), type: t.key, cost: '', summary: '', startDate: booking.startDate || '', endDate: booking.endDate || '' }}
                  onCancel={() => setAdding(null)}
                  onSave={saveOption}
                  isNew
                />
              )}
              {list.length === 0 && adding !== t.key && <p className="faint none">No {t.key.toLowerCase()} options yet.</p>}
            </section>
          );
        })}

        {/* ---------- Send quote ---------- */}
        <section className="card send">
          <h2 className="serif">Send the quote</h2>
          <label className="field">
            <span>Personal note to the client (optional — appears at the top of the quote)</span>
            <textarea
              rows={3}
              value={clientMessage}
              placeholder="Here are the holiday options I've put together for you."
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => {
                if (message !== null && message !== (booking.clientMessage || '')) update({ clientMessage: message });
              }}
            />
          </label>
          {options.length === 0 && <p className="faint">Add at least one option before sending.</p>}
          <div className="send-buttons">
            <Link
              href={`/bookings/${id}/whatsapp`}
              className={'btn whatsapp' + (options.length ? '' : ' disabled')}
              onClick={async (e) => {
                if (message !== null && message !== (booking.clientMessage || '')) {
                  e.preventDefault();
                  await update({ clientMessage: message });
                  router.push(`/bookings/${id}/whatsapp`);
                }
              }}
            >
              WhatsApp quote
            </Link>
            <Link
              href={`/bookings/${id}/email`}
              className={'btn email' + (options.length ? '' : ' disabled')}
              onClick={async (e) => {
                if (message !== null && message !== (booking.clientMessage || '')) {
                  e.preventDefault();
                  await update({ clientMessage: message });
                  router.push(`/bookings/${id}/email`);
                }
              }}
            >
              Email quote
            </Link>
          </div>
        </section>

        <div className="danger-zone">
          <button className="link-btn danger" onClick={deleteBooking}>
            Delete this booking
          </button>
        </div>
      </main>
    </>
  );
}

function DetailsForm({ booking, onCancel, onSave }) {
  const [name, setName] = useState(booking.name);
  const [summary, setSummary] = useState(booking.summary || '');
  const [startDate, setStartDate] = useState(booking.startDate || '');
  const [endDate, setEndDate] = useState(booking.endDate || '');
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="card form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onSave({ name, summary, startDate, endDate });
        } catch {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        <span>Client name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field">
        <span>Holiday request</span>
        <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>
      <div className="two">
        <label className="field">
          <span>Holiday start</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="field">
          <span>Holiday end</span>
          <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function OptionForm({ initial, onCancel, onSave, isNew }) {
  const [opt, setOpt] = useState(initial);
  const [busy, setBusy] = useState(false);
  const t = TYPE_BY_KEY[opt.type];
  const set = (k) => (e) => setOpt({ ...opt, [k]: e.target.value });

  return (
    <form
      className="card form option-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onSave(opt);
        } catch {
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <span>Type</span>
        <div className="segmented">
          {OPTION_TYPES.map((ot) => (
            <button
              type="button"
              key={ot.key}
              className={opt.type === ot.key ? 'on' : ''}
              onClick={() => setOpt({ ...opt, type: ot.key })}
            >
              {ot.emoji} {ot.key}
            </button>
          ))}
        </div>
      </div>
      <label className="field">
        <span>Cost</span>
        <input value={opt.cost} onChange={set('cost')} placeholder="e.g. 1240  or  £620 per person" />
      </label>
      <label className="field">
        <span>Summary</span>
        <textarea
          rows={4}
          value={opt.summary}
          onChange={set('summary')}
          placeholder={
            opt.type === 'Flights'
              ? 'e.g. easyJet EDI → GVA, 07:10 – 10:35, 23kg bag each, seats together'
              : opt.type === 'Accommodation'
                ? 'e.g. Chalet Les Airelles, 3 bedrooms, half board, kids club included'
                : 'e.g. Hertz, VW Touran or similar, 2 child seats, full insurance'
          }
        />
      </label>
      <div className="two">
        <label className="field">
          <span>{t.startLabel} date</span>
          <input type="date" value={opt.startDate} onChange={set('startDate')} />
        </label>
        <label className="field">
          <span>{t.endLabel} date</span>
          <input type="date" value={opt.endDate} min={opt.startDate || undefined} onChange={set('endDate')} />
        </label>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy}>
          {busy ? 'Saving…' : isNew ? 'Add option' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
