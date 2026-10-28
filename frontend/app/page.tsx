import Link from 'next/link';
import ProductCard from '@/app/components/ProductCard';
import { getProducts } from '@/app/lib/products';
import type { Category } from '@/app/types';

function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q = '', categoria } = await searchParams;
  const products = await getProducts();

  // Las categorías salen del propio catálogo (la API aún no tiene /categories)
  const categories = [
    ...new Map(products.filter((p) => p.category).map((p) => [p.category!.slug, p.category as Category])).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const query = normalize(q.trim());
  const filtered = products.filter(
    (p) =>
      (!categoria || p.category?.slug === categoria) &&
      (!query || normalize(`${p.name} ${p.brand?.name ?? ''}`).includes(query))
  );

  const isFiltering = Boolean(categoria || query);
  const featured = products.filter((p) => p.is_featured).slice(0, 4);
  const activeCategory = categories.find((c) => c.slug === categoria);

  const chipHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (slug) params.set('categoria', slug);
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  };

  return (
    <main className="py-6 sm:py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute -bottom-24 right-24 size-72 rounded-full bg-accent-400/30 blur-3xl" aria-hidden />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent-400" /> Entrega a domicilio
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Tu súper, fresco y a un clic.
          </h1>
          <p className="mt-3 text-white/85 sm:text-lg">
            Frutas, verduras, carnes, lácteos y todo lo de tu despensa, al mejor precio.
          </p>

          <form action="/" className="mt-6 flex max-w-md items-center gap-2 rounded-full bg-white p-1.5 shadow-lg">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="ml-3 size-5 shrink-0 text-muted" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar productos o marcas…"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted"
            />
            <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-900">
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* Categorías */}
      <nav
        className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        aria-label="Categorías"
      >
        <ul className="flex gap-2 pb-1">
          <li>
            <Link
              href={chipHref()}
              className={`block whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                !categoria ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-brand-500 hover:text-brand-700'
              }`}
            >
              Todo
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={chipHref(category.slug)}
                className={`block whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                  categoria === category.slug
                    ? 'border-ink bg-ink text-white'
                    : 'border-line bg-white text-ink hover:border-brand-500 hover:text-brand-700'
                }`}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Destacados */}
      {!isFiltering && featured.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Destacados de la semana</h2>
              <p className="text-sm text-muted">Lo más pedido por nuestros clientes</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} eager />
            ))}
          </div>
        </section>
      )}

      {/* Catálogo */}
      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{activeCategory?.name ?? 'Todos los productos'}</h2>
            <p className="text-sm text-muted">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
              {q && (
                <>
                  {' '}para <span className="font-medium text-ink">“{q}”</span>
                </>
              )}
            </p>
          </div>
          {isFiltering && (
            <Link href="/" className="text-sm font-medium text-brand-700 hover:underline">
              Limpiar filtros
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold">No encontramos productos</p>
            <p className="mt-1 text-sm text-muted">Prueba con otra búsqueda o categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
