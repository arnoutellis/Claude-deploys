'use client';

import { useMemo, useRef, useState } from 'react';
import Header from '@/components/Header';
import MarkIssued from '@/components/MarkIssued';
import useBooking from '@/components/useBooking';
import { copyRich, copyText } from '@/lib/client';
import { buildEmailHtml, buildEmailText, emailSubject } from '@/lib/format';

export default function EmailQuote() {
  const { id, booking, error, saving, update } = useBooking();
  const [copied, setCopied] = useState('');
  const bodyRef = useRef(null);

  const html = useMemo(() => (booking ? buildEmailHtml(booking) : ''), [booking]);
  const text = useMemo(() => (booking ? buildEmailText(booking) : ''), [booking]);
  const subject = booking ? emailSubject(booking) : '';

  function flash(what) {
    setCopied(what);
    setTimeout(() => setCopied(''), 2500);
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
              <h1 className="serif">Email quote</h1>
              <p className="muted">
                Copy the email, then paste it into a new message in Gmail, Outlook or Apple Mail — the formatting comes with it.
              </p>
            </div>

            <div className="copy-bar">
              <button
                className={'btn email big' + (copied === 'body' ? ' done' : '')}
                onClick={async () => flash((await copyRich(html, text, bodyRef.current)) ? 'body' : 'fail')}
              >
                {copied === 'body' ? '✓ Email copied' : copied === 'fail' ? 'Copy failed — try again' : 'Copy email to clipboard'}
              </button>
            </div>

            <div className="email-frame">
              <div className="email-fields">
                <div className="email-field">
                  <span className="label">Subject</span>
                  <span className="value">{subject}</span>
                  <button className="link-btn" onClick={async () => flash((await copyText(subject)) ? 'subject' : 'fail')}>
                    {copied === 'subject' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="email-body">
                <div ref={bodyRef} dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>

            <details className="raw">
              <summary>Plain-text version</summary>
              <textarea readOnly rows={14} value={text} onFocus={(e) => e.target.select()} />
              <button className="btn ghost small" onClick={async () => flash((await copyText(text)) ? 'text' : 'fail')}>
                {copied === 'text' ? '✓ Copied' : 'Copy plain text'}
              </button>
            </details>

            <MarkIssued booking={booking} update={update} saving={saving} />
          </>
        )}
      </main>
    </>
  );
}
