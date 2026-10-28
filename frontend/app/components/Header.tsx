import Link from 'next/link';
import { getCurrentUser } from '@/app/lib/users';
import { logoutAction } from '@/app/actions/auth';
import CartBadge from './CartBadge';

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l-1.2 10.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          </span>
          Tiendita
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user && (
            <Link
              href="/orders"
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-brand-50 hover:text-brand-700 sm:block"
            >
              Mis compras
            </Link>
          )}

          <CartBadge />

          {user ? (
            <div className="flex items-center gap-2">
              <span
                title={user.name}
                className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-gray-100 hover:text-ink"
                >
                  Salir
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
