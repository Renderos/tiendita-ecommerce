'use client';

import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import type { Product } from '@/app/types';

export default function QuickAddButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) return null;

  const handleClick = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Agregar ${product.name} al carrito`}
      className={`grid size-10 place-items-center rounded-full text-white shadow-md transition active:scale-95 ${
        added ? 'bg-brand-700' : 'bg-brand-600 hover:bg-brand-700'
      }`}
    >
      {added ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-5" aria-hidden>
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      )}
    </button>
  );
}
