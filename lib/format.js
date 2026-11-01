import { OPTION_TYPES, TYPE_BY_KEY, BRAND } from './constants';

export function fmtDate(d, short = false) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00Z');
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(short ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  }).replace(/,/g, '');
}

export function nights(a, b) {
  if (!a || !b) return 0;
  const n = Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
  return n > 0 ? n : 0;
}

export function dateRange(a, b) {
  if (a && b) {
    const sameYear = a.slice(0, 4) === b.slice(0, 4);
    return `${fmtDate(a, sameYear)} – ${fmtDate(b)}`;
  }
  return fmtDate(a) || fmtDate(b);
}

export function nightsText(a, b) {
  const n = nights(a, b);
  return n ? `${n} night${n === 1 ? '' : 's'}` : '';
}

// "1240" -> "£1,240"; anything with words or symbols is shown exactly as typed.
export function fmtCost(cost) {
  const s = String(cost || '').trim();
  if (!s) return '';
  const plain = s.replace(/,/g, '');
  if (/^\d+(\.\d{1,2})?$/.test(plain)) {
    const n = Number(plain);
    return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }
  return s;
}

export function optionDates(o) {
  const t = TYPE_BY_KEY[o.type] || OPTION_TYPES[0];
  const parts = [];
  if (o.startDate) parts.push(`${t.startLabel} ${fmtDate(o.startDate)}`);
  if (o.endDate) parts.push(`${t.endLabel} ${fmtDate(o.endDate)}`);
  let out = parts.join(' · ');
  if (o.type === 'Accommodation' && nights(o.startDate, o.endDate)) {
    out += ` (${nightsText(o.startDate, o.endDate)})`;
  }
  return out;
}

export function groupedOptions(booking) {
  const opts = booking.options || [];
  return OPTION_TYPES.map((t) => ({ type: t, options: opts.filter((o) => o.type === t.key) })).filter(
    (g) => g.options.length,
  );
}

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'there';
}

const DEFAULT_INTRO = "Here are the holiday options I've put together for you.";
const CLOSING = "Just let me know which options you'd like and I'll get everything reserved for you. Prices are correct at the time of sending and may change until booked.";

/* ---------------- WhatsApp ---------------- */

export function buildWhatsApp(b) {
  const L = [];
  L.push(`Hi ${firstName(b.name)} 👋`, '');
  L.push((b.clientMessage || '').trim() || DEFAULT_INTRO);
  if (b.startDate || b.endDate) {
    const n = nightsText(b.startDate, b.endDate);
    L.push('', `📅 *${dateRange(b.startDate, b.endDate)}*${n ? ` (${n})` : ''}`);
  }
  for (const g of groupedOptions(b)) {
    L.push('', `${g.type.emoji} *${g.type.key.toUpperCase()}*`);
    g.options.forEach((o, i) => {
      const cost = fmtCost(o.cost);
      L.push('', `*Option ${i + 1}*${cost ? ` — ${cost}` : ''}`);
      if (o.summary && o.summary.trim()) L.push(o.summary.trim());
      const d = optionDates(o);
      if (d) L.push(`_${d}_`);
    });
  }
  L.push('', CLOSING, '');
  L.push(`${BRAND.signOff} 🏔️`, BRAND.name, BRAND.phone);
  return L.join('\n');
}

/* ---------------- Email ---------------- */

export function emailSubject(b) {
  const range = dateRange(b.startDate, b.endDate);
  return `Your holiday options${range ? ` · ${range}` : ''} | ${BRAND.name}`;
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nl2br = (s) => esc(s).replace(/\r?\n/g, '<br>');

const C = {
  ink: '#34495e',
  muted: '#7b8a99',
  blue: '#5a7fa6',
  blueSoft: '#e4eef8',
  pink: '#c0798f',
  pinkSoft: '#fbeef2',
  line: '#e3eaf2',
};
const FONT = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;";
const SERIF = "font-family:Georgia,'Times New Roman',serif;";

export function buildEmailHtml(b) {
  const p = (html, extra = '') => `<p style="margin:0 0 14px;${FONT}font-size:15px;line-height:1.6;color:${C.ink};${extra}">${html}</p>`;
  const parts = [];

  parts.push(p(`Hi ${esc(firstName(b.name))},`));
  parts.push(p(nl2br((b.clientMessage || '').trim() || DEFAULT_INTRO)));

  if (b.startDate || b.endDate) {
    const n = nightsText(b.startDate, b.endDate);
    parts.push(
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;margin:6px 0 22px;"><tr><td style="background:${C.pinkSoft};border-radius:10px;padding:14px 18px;${FONT}">` +
        `<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.pink};font-weight:bold;">Your travel dates</div>` +
        `<div style="font-size:17px;color:${C.ink};margin-top:4px;${SERIF}">${esc(dateRange(b.startDate, b.endDate))}${n ? ` <span style="color:${C.muted};font-size:14px;">· ${esc(n)}</span>` : ''}</div>` +
        `</td></tr></table>`,
    );
  }

  for (const g of groupedOptions(b)) {
    parts.push(
      `<div style="${SERIF}font-size:20px;color:${C.blue};margin:22px 0 10px;padding-bottom:6px;border-bottom:2px solid ${C.blueSoft};">${g.type.emoji}&nbsp; ${esc(g.type.key)}</div>`,
    );
    g.options.forEach((o, i) => {
      const cost = fmtCost(o.cost);
      const d = optionDates(o);
      parts.push(
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;margin:0 0 12px;border:1px solid ${C.line};border-radius:10px;"><tr><td style="padding:14px 18px;${FONT}">` +
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>` +
          `<td style="${FONT}font-size:14px;font-weight:bold;color:${C.ink};">Option ${i + 1}</td>` +
          `<td align="right" style="${FONT}font-size:16px;font-weight:bold;color:${C.pink};">${esc(cost)}</td>` +
          `</tr></table>` +
          (o.summary && o.summary.trim()
            ? `<div style="font-size:14px;line-height:1.55;color:${C.ink};margin-top:6px;">${nl2br(o.summary.trim())}</div>`
            : '') +
          (d ? `<div style="font-size:12.5px;color:${C.muted};margin-top:8px;">${esc(d)}</div>` : '') +
          `</td></tr></table>`,
      );
    });
  }

  parts.push(`<div style="height:10px;"></div>`);
  parts.push(p(esc(CLOSING)));
  parts.push(p(`Warm wishes,<br><span style="${SERIF}font-size:18px;color:${C.blue};">${esc(BRAND.signOff)}</span>`, 'margin-bottom:0;'));

  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;border-collapse:separate;background:#ffffff;">` +
    `<tr><td style="background:${C.blueSoft};padding:26px 30px;text-align:center;border-radius:12px 12px 0 0;">` +
    `<div style="${SERIF}font-size:26px;color:${C.blue};">${esc(BRAND.name)}</div>` +
    `<div style="${FONT}font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.pink};margin-top:6px;">Your holiday options</div>` +
    `</td></tr>` +
    `<tr><td style="padding:28px 30px 24px;border-left:1px solid ${C.line};border-right:1px solid ${C.line};">${parts.join('')}</td></tr>` +
    `<tr><td style="background:${C.pinkSoft};padding:16px 30px;text-align:center;border-radius:0 0 12px 12px;${FONT}font-size:12px;line-height:1.6;color:${C.muted};">` +
    `${esc(BRAND.name)} · ${esc(BRAND.phone)} · <a href="mailto:${esc(BRAND.email)}" style="color:${C.blue};text-decoration:none;">${esc(BRAND.email)}</a><br>` +
    `<a href="https://${esc(BRAND.website)}" style="color:${C.blue};text-decoration:none;">${esc(BRAND.website)}</a>` +
    `</td></tr></table>`
  );
}

export function buildEmailText(b) {
  const L = [];
  L.push(`Hi ${firstName(b.name)},`, '');
  L.push((b.clientMessage || '').trim() || DEFAULT_INTRO);
  if (b.startDate || b.endDate) {
    const n = nightsText(b.startDate, b.endDate);
    L.push('', `Your travel dates: ${dateRange(b.startDate, b.endDate)}${n ? ` (${n})` : ''}`);
  }
  for (const g of groupedOptions(b)) {
    L.push('', `${g.type.emoji} ${g.type.key.toUpperCase()}`);
    g.options.forEach((o, i) => {
      const cost = fmtCost(o.cost);
      L.push('', `Option ${i + 1}${cost ? ` — ${cost}` : ''}`);
      if (o.summary && o.summary.trim()) L.push(o.summary.trim());
      const d = optionDates(o);
      if (d) L.push(d);
    });
  }
  L.push('', CLOSING, '', 'Warm wishes,', BRAND.signOff, '', `${BRAND.name} · ${BRAND.phone} · ${BRAND.email}`);
  return L.join('\n');
}
