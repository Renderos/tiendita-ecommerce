'use client';

import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import type { Product } from '@/app/types';
import QuantityStepper from './QuantityStepper';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (outOfStock) {
    return (
      <button disabled className="w-full rounded-full bg-gray-100 px-6 py-3.5 font-semibold text-muted">
        Agotado
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <QuantityStepper value={quantity} max={product.stock} onChange={setQuantity} size="lg" />
      <button
        onClick={handleAdd}
        className={`flex-1 rounded-full px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition active:scale-[0.98] ${
          added ? 'bg-brand-700' : 'bg-brand-600 hover:bg-brand-700'
        }`}
      >
        {added ? 'Agregado al carrito ✓' : 'Agregar al carrito'}
      </button>
    </div>
  );
}
