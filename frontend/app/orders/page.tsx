import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/app/lib/auth';
import { getOrders } from '@/app/lib/orders';
import { formatPrice } from '@/app/lib/format';
import OrderStatusBadge from '@/app/components/OrderStatusBadge';
import ProductImage from '@/app/components/ProductImage';

function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-SV', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function OrdersPage() {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  const orders = await getOrders();

  if (orders.length === 0) {
    return (
      <main className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-brand-50 text-4xl">🧾</div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Historial de compras</h1>
        <p className="mt-2 text-muted">Todavía no tienes compras registradas.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          Ver catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl py-8 sm:py-10">
      <h1 className="text-3xl font-bold tracking-tight">Historial de compras</h1>

      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand-500 hover:shadow-lg hover:shadow-brand-900/5"
          >
            <div className="flex -space-x-3">
              {order.items.slice(0, 3).map((item) =>
                item.product ? (
                  <ProductImage
                    key={item.id}
                    product={item.product}
                    sizes="48px"
                    className="size-12 rounded-full ring-2 ring-white"
                  />
                ) : null
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">Orden #{order.id}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {formatDate(order.created_at)} · {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-lg font-bold">{formatPrice(order.total)}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
