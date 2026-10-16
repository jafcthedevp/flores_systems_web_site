import { NextResponse, type NextRequest } from 'next/server';
import { createSessionClient } from '@/lib/supabase/server';
import { requiredEnv } from '@/lib/env';
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const client = await createSessionClient();
  const result = code ? await client.auth.exchangeCodeForSession(code) : null;
  return NextResponse.redirect(new URL(result && !result.error ? '/admin/restablecer' : '/admin/login?error=callback', requiredEnv('APP_URL')));
}
