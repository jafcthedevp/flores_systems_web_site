import { AuthForm } from '@/components/admin/auth-form';
import { currentAdmin } from '@/lib/server/live-crm';
import { redirect } from 'next/navigation';
export default async function Reset() { if (!await currentAdmin()) redirect('/admin/login?error=recovery'); return <AuthForm mode="reset" />; }
