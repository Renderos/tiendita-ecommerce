import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { isAuthenticated } from '@/app/lib/auth';
import { getOrder } from '@/app/lib/orders';
import { ApiError } from '@/app/lib/api';
import OrderItemsCard from '@/app/components/OrderItemsCard';
import OrderStatusBadge from '@/app/components/OrderStatusBadge';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  const { id } = await params;

  let order;
  try {
    order = await getOrder(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto max-w-2xl py-8 sm:py-10">
      <Link href="/orders" className="text-sm font-medium text-muted hover:text-ink">
        ← Volver al historial
      </Link>

      <div className="mb-6 mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Orden #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <OrderItemsCard order={order} />

      {order.payment && (
        <div className="mt-4 rounded-2xl border border-line bg-white p-6 text-sm">
          <h2 className="font-semibold">Pago</h2>
          <dl className="mt-3 space-y-1.5 text-muted">
            <div className="flex justify-between">
              <dt>Método</dt>
              <dd className="text-ink">{order.payment.payment_method ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Estado</dt>
              <dd className="text-ink">{order.payment.status}</dd>
            </div>
          </dl>
        </div>
      )}
    </main>
  );
}
