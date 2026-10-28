'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { getStripe } from '@/app/lib/stripe-client';
import { useCart } from '@/app/context/CartContext';
import { createOrderAction } from '@/app/actions/orders';
import { formatPrice } from '@/app/lib/format';

function CheckoutFormInner() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsProcessing(true);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError || !paymentMethod) {
      setError(stripeError?.message ?? 'No se pudo validar la tarjeta');
      setIsProcessing(false);
      return;
    }

    const result = await createOrderAction({
      items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
      payment_method: paymentMethod.id,
    });

    setIsProcessing(false);

    if (!result.success || !result.order) {
      setError(result.error ?? 'El pago no se pudo completar');
      return;
    }

    clearCart();
    router.push(`/checkout/success?order=${result.order.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-line bg-white px-4 py-3.5 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
        <CardElement
          options={{ style: { base: { fontSize: '16px', color: '#0f1a14', '::placeholder': { color: '#8a978f' } } } }}
        />
      </div>

      {error && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || isProcessing || items.length === 0}
        className="w-full rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-60"
      >
        {isProcessing ? 'Procesando…' : `Pagar ${formatPrice(total)}`}
      </button>

      <p className="text-center text-xs text-muted">
        Modo de prueba: tarjeta 4242 4242 4242 4242, cualquier fecha futura, cualquier CVC.
      </p>
    </form>
  );
}

export default function CheckoutForm() {
  return (
    <Elements stripe={getStripe()}>
      <CheckoutFormInner />
    </Elements>
  );
}