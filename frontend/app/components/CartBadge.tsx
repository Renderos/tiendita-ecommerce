'use client';

import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

export default function CartBadge() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Carrito (${itemCount} productos)`}
      className="relative grid size-10 place-items-center rounded-full text-ink transition hover:bg-brand-50 hover:text-brand-700"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-6" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
