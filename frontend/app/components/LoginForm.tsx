'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, type AuthFormState } from '@/app/actions/auth';

const initialState: AuthFormState = { error: null };

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="rounded-3xl border border-line bg-white p-8 shadow-xl shadow-brand-900/5">
      <h1 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h1>
      <p className="mt-1 text-sm text-muted">Inicia sesión para continuar con tu compra.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input type="email" name="email" placeholder="tu@correo.com" autoComplete="email" className={inputClass} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Contraseña</span>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className={inputClass}
            required
          />
        </label>

        {state.error && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
