import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const COOKIE_NAME = 'ruthie_session';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function secret() {
  return process.env.AUTH_SECRET || '';
}

export function sessionToken() {
  return crypto
    .createHmac('sha256', secret() + '|' + (process.env.APP_PASSWORD || ''))
    .update('ruthie-quotes-session-v1')
    .digest('hex');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(password) {
  const expected = process.env.APP_PASSWORD;
  if (!expected || !secret()) return false;
  return safeEqual(password || '', expected);
}

export async function isAuthed() {
  if (!process.env.APP_PASSWORD || !secret()) return false;
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return false;
  return safeEqual(value, sessionToken());
}

export function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}
