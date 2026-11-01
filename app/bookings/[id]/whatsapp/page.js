'use client';

import { Fragment, useMemo, useState } from 'react';
import Header from '@/components/Header';
import MarkIssued from '@/components/MarkIssued';
import useBooking from '@/components/useBooking';
import { copyText } from '@/lib/client';
import { buildWhatsApp } from '@/lib/format';

// Render WhatsApp's *bold*, _italic_ and ~strike~ so the preview looks like the real thing.
function renderLine(line, key) {
  const parts = [];
  const re = /([*_~])([^*_~\n]+?)\1/g;
  let last = 0;
  let m;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    const Tag = m[1] === '*' ? 'strong' : m[1] === '_' ? 'em' : 's';
    parts.push(<Tag key={m.index}>{m[2]}</Tag>);
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return (
    <Fragment key={key}>
      {parts}
      <br />
    </Fragment>
  );
}

export default function WhatsAppQuote() {
  const { id, booking, error, saving, update } = useBooking();
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => (booking ? buildWhatsApp(booking) : ''), [booking]);

  async function copy() {
    const ok = await copyText(text);
    setCopied(ok ? 'yes' : 'fail');
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <>
      <Header back={{ href: `/bookings/${id}`, label: booking ? booking.name : 'Booking' }} />
      <main className="wrap narrow">
        {error && <p className="error">{error}</p>}
        {!booking ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <div className="export-head">
              <h1 className="serif">WhatsApp quote</h1>
              <p className="muted">Copy, then paste into your chat with {booking.name.split(' ')[0]}.</p>
            </div>

            <div className="copy-bar">
              <button className={'btn whatsapp big' + (copied === 'yes' ? ' done' : '')} onClick={copy}>
                {copied === 'yes' ? '✓ Copied' : copied === 'fail' ? 'Copy failed — select the text below' : 'Copy to clipboard'}
              </button>
              <a className="btn ghost" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
                Open in WhatsApp
              </a>
            </div>

            <div className="wa-screen">
              <div className="wa-bubble">{text.split('\n').map((l, i) => renderLine(l, i))}</div>
            </div>

            <details className="raw">
              <summary>Show plain text</summary>
              <textarea readOnly rows={14} value={text} onFocus={(e) => e.target.select()} />
            </details>

            <MarkIssued booking={booking} update={update} saving={saving} />
          </>
        )}
      </main>
    </>
  );
}
