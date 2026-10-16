import { Resend, type Response as ResendResponse } from 'resend';

// El SDK fijado no acepta signal en emails.send. Su transporte público permite
// acotar cada petición y devolver errores sin direcciones ni mensajes del proveedor.
export class NotificationMailer extends Resend {
  override async fetchRequest<T>(path: string, options: RequestInit = {}): Promise<ResendResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options, signal: AbortSignal.timeout(8000),
      });
      const headers = Object.fromEntries(response.headers.entries());
      if (!response.ok) return {
        data: null, headers,
        error: { name: 'application_error' as const, message: 'provider_rejected', statusCode: response.status },
      };
      return { data: await response.json() as T, headers, error: null };
    } catch {
      return {
        data: null, headers: null,
        error: { name: 'application_error' as const, message: 'provider_unavailable', statusCode: null },
      };
    }
  }
}
