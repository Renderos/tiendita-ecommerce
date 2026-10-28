import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/app/lib/auth';
import CartSummary from '@/app/components/CartSummary';
import CheckoutForm from '@/app/components/CheckoutForm';

export default async function CheckoutPage() {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  return (
    <main className="py-8 sm:py-10">
      <Link href="/cart" className="text-sm font-medium text-muted hover:text-ink">
        ← Volver al carrito
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Pagar pedido</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold">Método de pago</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Tus datos de tarjeta se procesan de forma segura con Stripe.</p>
          <CheckoutForm />
        </section>
        <CartSummary />
      </div>
    </main>
  );
}
