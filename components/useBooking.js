'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/client';

export default function useBooking() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api(`/api/bookings/${id}`)
      .then((d) => setBooking(d.booking))
      .catch((e) => setError(e.message));
  }, [id]);

  // Send only the changed fields; the server returns the saved booking.
  const update = useCallback(
    async (changes) => {
      setSaving(true);
      setError('');
      try {
        const { booking: saved } = await api(`/api/bookings/${id}`, {
          method: 'PUT',
          body: JSON.stringify(changes),
        });
        setBooking(saved);
        return saved;
      } catch (e) {
        setError(e.message);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [id],
  );

  return { id, booking, setBooking, error, setError, saving, update };
}
