import crypto from 'node:crypto';
import { STATUSES, TYPE_BY_KEY } from './constants';

const str = (v, max = 5000) => (typeof v === 'string' ? v.slice(0, max) : '');
const date = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');

export function cleanOption(o = {}) {
  return {
    id: str(o.id, 64) || crypto.randomUUID(),
    type: TYPE_BY_KEY[o.type] ? o.type : 'Flights',
    cost: str(o.cost, 200),
    summary: str(o.summary, 5000),
    startDate: date(o.startDate),
    endDate: date(o.endDate),
  };
}

// Merge allowed fields from `input` onto an existing booking.
export function applyBookingUpdate(existing, input = {}) {
  const b = { ...existing };
  if ('name' in input) b.name = str(input.name, 200).trim();
  if ('summary' in input) b.summary = str(input.summary, 5000);
  if ('startDate' in input) b.startDate = date(input.startDate);
  if ('endDate' in input) b.endDate = date(input.endDate);
  if ('clientMessage' in input) b.clientMessage = str(input.clientMessage, 3000);
  if ('status' in input && STATUSES.includes(input.status)) b.status = input.status;
  if ('options' in input && Array.isArray(input.options)) {
    b.options = input.options.slice(0, 200).map(cleanOption);
  }
  b.updatedAt = new Date().toISOString();
  return b;
}

export function newBooking(input = {}) {
  const now = new Date().toISOString();
  return applyBookingUpdate(
    {
      id: crypto.randomUUID(),
      name: '',
      summary: '',
      startDate: '',
      endDate: '',
      clientMessage: '',
      status: 'Open',
      options: [],
      createdAt: now,
      updatedAt: now,
    },
    { name: input.name, summary: input.summary, startDate: input.startDate, endDate: input.endDate },
  );
}
