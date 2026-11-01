import { NextResponse } from 'next/server';
import { isAuthed, unauthorized } from '@/lib/auth';
import { loadBookings, saveBookings } from '@/lib/store';
import { applyBookingUpdate } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
const failed = (err) => {
  console.error(err);
  return NextResponse.json({ error: 'Something went wrong saving that. Please try again.' }, { status: 500 });
};

export async function GET(_request, { params }) {
  if (!(await isAuthed())) return unauthorized();
  const { id } = await params;
  try {
    const booking = (await loadBookings()).find((b) => b.id === id);
    return booking ? NextResponse.json({ booking }) : notFound();
  } catch (err) {
    return failed(err);
  }
}

// Partial update: send only the fields that changed (options is sent as the full list).
export async function PUT(request, { params }) {
  if (!(await isAuthed())) return unauthorized();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const bookings = await loadBookings();
    const i = bookings.findIndex((b) => b.id === id);
    if (i === -1) return notFound();
    const updated = applyBookingUpdate(bookings[i], body);
    if (!updated.name) {
      return NextResponse.json({ error: 'The client’s name can’t be empty.' }, { status: 400 });
    }
    bookings[i] = updated;
    await saveBookings(bookings);
    return NextResponse.json({ booking: updated });
  } catch (err) {
    return failed(err);
  }
}

export async function DELETE(_request, { params }) {
  if (!(await isAuthed())) return unauthorized();
  const { id } = await params;
  try {
    const bookings = await loadBookings();
    const remaining = bookings.filter((b) => b.id !== id);
    if (remaining.length === bookings.length) return notFound();
    await saveBookings(remaining);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return failed(err);
  }
}
