import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { isAuthenticated } from '@/app/lib/auth';
import { getOrder } from '@/app/lib/orders';
import { ApiError } from '@/app/lib/api';
import OrderItemsCard from '@/app/components/OrderItemsCard';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  let order;
  try {
    order = await getOrder(orderId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="mx-auto max-w-lg py-12 text-center sm:py-16">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-8" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L19 7" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">¡Compra exitosa!</h1>
      <p className="mb-8 mt-2 text-muted">Tu orden #{order.id} fue procesada correctamente.</p>

      <OrderItemsCard order={order} />

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={`/orders/${order.id}`}
          className="rounded-full border border-line bg-white px-6 py-3 font-semibold transition hover:border-brand-500"
        >
          Ver mi orden
        </Link>
        <Link
          href="/"
          className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}
