export function statusClass(status) {
  return 'pill s-' + String(status || 'Open').toLowerCase().replace(/\s+/g, '-');
}

export default function StatusPill({ status }) {
  return <span className={statusClass(status)}>{status}</span>;
}
