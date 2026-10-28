'use client';

import { useCart } from '@/app/context/CartContext';
import { formatPrice } from '@/app/lib/format';
import ProductImage from './ProductImage';

export default function CartSummary() {
  const { items, total } = useCart();

  if (items.length === 0) {
    return <p className="rounded-2xl border border-line bg-white p-6 text-sm text-muted">Tu carrito está vacío.</p>;
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold">Tu pedido</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.product.id} className="flex items-center gap-3 text-sm">
            <div className="relative shrink-0">
              <ProductImage product={item.product} sizes="48px" className="size-12 rounded-lg" />
              <span className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold leading-5 text-white">
                {item.quantity}
              </span>
            </div>
            <span className="line-clamp-2 flex-1">{item.product.name}</span>
            <span className="font-medium">{formatPrice(Number(item.product.price) * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="font-semibold">Total</span>
        <span className="text-2xl font-bold tracking-tight">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
