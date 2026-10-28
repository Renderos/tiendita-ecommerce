import type { Order } from '@/app/types';
import { formatPrice } from '@/app/lib/format';
import ProductImage from './ProductImage';

// Lista de productos de una orden con el desglose de totales
export default function OrderItemsCard({ order }: { order: Order }) {
  const subtotal = order.subtotal ?? order.total;
  const deliveryFee = Number(order.delivery_fee ?? 0);
  const discount = Number(order.discount_amount ?? 0);

  return (
    <div className="rounded-2xl border border-line bg-white p-6 text-left">
      <ul className="space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 text-sm">
            {item.product && <ProductImage product={item.product} sizes="48px" className="size-12 shrink-0 rounded-lg" />}
            <span className="flex-1">
              {item.product?.name ?? `Producto #${item.product_id}`}
              <span className="text-muted"> × {item.quantity}</span>
            </span>
            <span className="font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {deliveryFee > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">Envío</dt>
            <dd>{formatPrice(deliveryFee)}</dd>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-brand-700">
            <dt>Descuento</dt>
            <dd>−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between pt-2">
          <dt className="font-semibold">Total</dt>
          <dd className="text-xl font-bold tracking-tight">{formatPrice(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
