import { redirect } from 'next/navigation';
import RegisterForm from '@/app/components/RegisterForm';
import { isAuthenticated } from '@/app/lib/auth';

export default async function RegisterPage() {
  if (await isAuthenticated()) {
    redirect('/');
  }

  return (
    <main className="mx-auto max-w-md py-12 sm:py-16">
      <RegisterForm />
    </main>
  );
}