import { NextResponse } from 'next/server';
import { isAuthed, unauthorized } from '@/lib/auth';
import { loadBookings, saveBookings } from '@/lib/store';
import { newBooking } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    const bookings = await loadBookings();
    bookings.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Could not load bookings.' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAuthed())) return unauthorized();
  const body = await request.json().catch(() => ({}));
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: 'Please enter the client’s name.' }, { status: 400 });
  }
  try {
    const bookings = await loadBookings();
    const booking = newBooking(body);
    bookings.push(booking);
    await saveBookings(bookings);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Could not save the booking.' }, { status: 500 });
  }
}
