export const STATUSES = [
  'Open',
  'Quote issued',
  'Quote accepted',
  'Quote rejected',
  'Booked',
  'Holiday completed',
];

// Statuses that count as "open jobs" on the dashboard.
export const ACTIVE_STATUSES = ['Open', 'Quote issued', 'Quote accepted', 'Booked'];

export const OPTION_TYPES = [
  { key: 'Flights', emoji: '✈️', startLabel: 'Outbound', endLabel: 'Return' },
  { key: 'Accommodation', emoji: '🏨', startLabel: 'Check-in', endLabel: 'Check-out' },
  { key: 'Hire Car', emoji: '🚗', startLabel: 'Pick-up', endLabel: 'Drop-off' },
];

export const TYPE_BY_KEY = Object.fromEntries(OPTION_TYPES.map((t) => [t.key, t]));

// Business details used in the quote sign-off. Edit here to change them.
export const BRAND = {
  name: 'Travels with Ruthie',
  signOff: 'Ruth',
  phone: '07521 158048',
  email: 'ruth@travelswithruthie.com',
  website: 'travelswithruthie.com',
};
