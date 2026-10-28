'use client';

import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { formatPrice, formatUnit } from '@/app/lib/format';
import ProductImage from '@/app/components/ProductImage';
import QuantityStepper from '@/app/components/QuantityStepper';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-brand-50 text-4xl">🛒</div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted">Agrega productos del catálogo para empezar tu compra.</p>
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
    <main className="py-8 sm:py-10">
      <h1 className="text-3xl font-bold tracking-tight">Tu carrito</h1>
      <p className="mt-1 text-muted">
        {itemCount} artículo{itemCount !== 1 ? 's' : ''}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {items.map((item) => {
            const unit = formatUnit(item.product.unit);
            return (
              <li key={item.product.id} className="flex gap-4 p-4">
                <Link href={`/products/${item.product.id}`} className="shrink-0">
                  <ProductImage product={item.product} sizes="96px" className="size-20 rounded-xl sm:size-24" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/products/${item.product.id}`} className="line-clamp-2 font-semibold hover:text-brand-700">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted">
                        {formatPrice(item.product.price)}
                        {unit && ` / ${unit}`}
                      </p>
                    </div>
                    <p className="font-bold">{formatPrice(Number(item.product.price) * item.quantity)}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper
                      value={item.quantity}
                      max={item.product.stock}
                      onChange={(quantity) => updateQuantity(item.product.id, quantity)}
                    />
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-sm font-medium text-muted transition hover:text-danger"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-medium">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Envío y descuentos</dt>
              <dd className="text-muted">Se calculan al pagar</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-semibold">Total estimado</span>
            <span className="text-2xl font-bold tracking-tight">{formatPrice(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-brand-600 px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Proceder al pago
          </Link>
          <div className="mt-4 flex justify-between text-sm">
            <Link href="/" className="font-medium text-brand-700 hover:underline">
              Seguir comprando
            </Link>
            <button onClick={clearCart} className="text-muted hover:text-danger">
              Vaciar carrito
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
