import Link from 'next/link';
import type { Product } from '@/app/types';
import { formatPrice, formatUnit } from '@/app/lib/format';
import ProductImage from './ProductImage';
import QuickAddButton from './QuickAddButton';

export default function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.min_stock_alert !== undefined && product.stock <= product.min_stock_alert;
  const unit = formatUnit(product.unit);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/5">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative">
          <ProductImage
            product={product}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            eager={eager}
            className="aspect-square transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.is_featured && (
              <span className="rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                Destacado
              </span>
            )}
            {outOfStock && (
              <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white">Agotado</span>
            )}
            {lowStock && (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-danger shadow-sm">
                ¡Últimas unidades!
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {product.category && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{product.category.name}</p>
          )}
          <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-ink">{product.name}</h3>
          {product.description && <p className="mt-1 line-clamp-1 text-sm text-muted">{product.description}</p>}

          <div className="mt-auto pt-4 pr-12">
            <p className="text-xl font-bold tracking-tight text-ink">{formatPrice(product.price)}</p>
            {unit && <p className="text-xs text-muted">por {unit}</p>}
          </div>
        </div>
      </Link>

      <div className="absolute bottom-4 right-4">
        <QuickAddButton product={product} />
      </div>
    </article>
  );
}
