import { get, put } from '@vercel/blob';

// All bookings live in one private JSON document in Vercel Blob.
// A daily backup copy is also written so a bad save can be recovered.
const DATA_PATH = 'data/bookings.json';

function isNotFound(err) {
  const name = (err && (err.name || err.constructor?.name)) || '';
  return /NotFound/i.test(name) || /not found/i.test(String(err?.message || ''));
}

export async function loadBookings() {
  let res;
  try {
    res = await get(DATA_PATH, { access: 'private', useCache: false });
  } catch (err) {
    if (isNotFound(err)) return [];
    throw err; // never treat an unknown error as "empty" — that could wipe data on the next save
  }
  if (!res) return [];
  if (res.statusCode !== 200 || !res.stream) {
    throw new Error(`Unexpected storage response: ${res.statusCode}`);
  }
  const text = await new Response(res.stream).text();
  const data = JSON.parse(text);
  return Array.isArray(data.bookings) ? data.bookings : [];
}

export async function saveBookings(bookings) {
  const body = JSON.stringify({ bookings, savedAt: new Date().toISOString() });
  const opts = {
    access: 'private',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json',
  };
  await put(DATA_PATH, body, opts);
  const day = new Date().toISOString().slice(0, 10);
  try {
    await put(`backups/bookings-${day}.json`, body, opts);
  } catch (err) {
    console.error('Backup write failed', err);
  }
}
