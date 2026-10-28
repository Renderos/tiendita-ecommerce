'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction, type AuthFormState } from '@/app/actions/auth';

const initialState: AuthFormState = { error: null };

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div className="rounded-3xl border border-line bg-white p-8 shadow-xl shadow-brand-900/5">
      <h1 className="text-2xl font-bold tracking-tight">Crea tu cuenta</h1>
      <p className="mt-1 text-sm text-muted">Haz tus compras más rápido y revisa tu historial.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nombre</span>
          <input type="text" name="name" placeholder="Mínimo 5 caracteres" autoComplete="name" className={inputClass} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input type="email" name="email" placeholder="tu@correo.com" autoComplete="email" className={inputClass} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Contraseña</span>
          <input
            type="password"
            name="password"
            placeholder="Mín. 8, con mayúscula, número y símbolo"
            autoComplete="new-password"
            className={inputClass}
            required
          />
        </label>

        {(state.error || state.fieldErrors) && (
          <div className="space-y-1 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {state.error && <p>{state.error}</p>}
            {state.fieldErrors &&
              Object.entries(state.fieldErrors).map(([field, messages]) => <p key={field}>{messages.join(' ')}</p>)}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? 'Registrando…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
