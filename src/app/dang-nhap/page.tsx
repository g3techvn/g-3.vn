import { Suspense } from 'react';
import LoginForm from './LoginForm';

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({
  searchParams
}: PageProps) {
  const params = await searchParams || {};
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    }>
      <LoginForm redirectTo={(typeof params?.redirect === 'string' ? params.redirect : '/tai-khoan')} />
    </Suspense>
  );
} 