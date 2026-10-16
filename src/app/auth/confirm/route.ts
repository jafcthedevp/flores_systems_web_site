import { NextResponse, type NextRequest } from 'next/server';
import { createSessionClient } from '@/lib/supabase/server';
import { requiredEnv } from '@/lib/env';
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  const client = await createSessionClient();
  const validType = type === 'recovery' || type === 'invite';
  const result = token_hash && validType ? await client.auth.verifyOtp({ token_hash, type }) : null;
  return NextResponse.redirect(new URL(result && !result.error ? '/admin/restablecer' : '/admin/login?error=callback', requiredEnv('APP_URL')));
}
