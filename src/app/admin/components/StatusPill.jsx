const CLASS = {
  Pending: 'pill pill--pending',
  Shipped: 'pill pill--shipped',
  Delivered: 'pill pill--delivered',
  Canceled: 'pill pill--canceled',
  Abandoned: 'pill pill--abandoned',
  Returned: 'pill pill--returned'
};

export function StatusPill({ status }) {
  return <span className={CLASS[status] ?? 'pill'}>{status}</span>;
}
