import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError } from '@/app/lib/api';
import { getProduct } from '@/app/lib/products';
import { formatPrice, formatUnit } from '@/app/lib/format';
import AddToCartButton from '@/app/components/AddToCartButton';
import ProductImage from '@/app/components/ProductImage';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.min_stock_alert !== undefined && product.stock <= product.min_stock_alert;
  const unit = formatUnit(product.unit);

  return (
    <main className="py-6 sm:py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Ruta">
        <Link href="/" className="hover:text-ink">Inicio</Link>
        {product.category && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/?categoria=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductImage
          product={product}
          sizes="(min-width: 1024px) 560px, 100vw"
          preload
          className="aspect-square rounded-3xl border border-line"
        />

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            {product.is_featured && (
              <span className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white">Destacado</span>
            )}
            {product.brand && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-muted">{product.brand.name}</span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
          {product.description && <p className="mt-3 text-lg text-muted">{product.description}</p>}

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">{formatPrice(product.price)}</span>
            {unit && <span className="text-muted">/ {unit}</span>}
          </div>

          <p
            className={`mt-3 inline-flex items-center gap-2 text-sm font-medium ${
              outOfStock ? 'text-danger' : lowStock ? 'text-accent-500' : 'text-brand-600'
            }`}
          >
            <span className={`size-2 rounded-full ${outOfStock ? 'bg-danger' : lowStock ? 'bg-accent-500' : 'bg-brand-500'}`} />
            {outOfStock ? 'Agotado' : lowStock ? `¡Quedan solo ${product.stock}!` : `En stock · ${product.stock} disponibles`}
          </p>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <ul className="mt-8 grid gap-3 rounded-2xl border border-line bg-white p-5 text-sm text-muted sm:grid-cols-2">
            <li className="flex items-center gap-2">🚚 Entrega a domicilio</li>
            <li className="flex items-center gap-2">🔒 Pago seguro con Stripe</li>
            <li className="flex items-center gap-2">🥬 Productos frescos cada día</li>
            <li className="flex items-center gap-2">↩️ Cambios sin complicaciones</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
