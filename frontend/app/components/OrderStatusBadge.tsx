const STATUS: Record<string, { text: string; className: string }> = {
  pending: { text: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  paid: { text: 'Pagada', className: 'bg-brand-100 text-brand-700' },
  preparing: { text: 'En preparación', className: 'bg-sky-100 text-sky-800' },
  shipped: { text: 'En camino', className: 'bg-indigo-100 text-indigo-800' },
  delivered: { text: 'Entregada', className: 'bg-brand-600 text-white' },
  cancelled: { text: 'Cancelada', className: 'bg-rose-100 text-rose-700' },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const { text, className } = STATUS[status] ?? { text: status, className: 'bg-gray-100 text-muted' };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{text}</span>;
}
