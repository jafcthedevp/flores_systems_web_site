'use server';
import { headers } from 'next/headers';
import { formToQuote, type ActionResult } from '@/lib/contracts/quote-requests';
import { submitQuote } from '@/lib/services/quote-requests';
export async function submitQuoteRequest(_previous: ActionResult | null, form: FormData): Promise<ActionResult> {
  let bytes = 0;
  for (const [key, value] of form) {
    if (typeof value !== 'string') return { ok: false, code: 'invalid' };
    bytes += Buffer.byteLength(key) + Buffer.byteLength(value);
    if (bytes > 12000) return { ok: false, code: 'invalid' };
  }
  return submitQuote(formToQuote(form), await headers());
}
