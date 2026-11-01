'use client';

import StatusPill from './StatusPill';

// Shown under the copy button: quick way to move the booking to "Quote issued".
export default function MarkIssued({ booking, update, saving }) {
  if (booking.status !== 'Open') {
    return (
      <p className="muted mark-issued">
        Status: <StatusPill status={booking.status} />
      </p>
    );
  }
  return (
    <p className="mark-issued">
      <button className="btn ghost small" disabled={saving} onClick={() => update({ status: 'Quote issued' })}>
        Mark as “Quote issued”
      </button>
    </p>
  );
}
