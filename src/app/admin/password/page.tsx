import { requireAdmin } from '@/lib/auth/admin';
import { changePassword } from '@/app/auth/actions';
export const dynamic = 'force-dynamic';
export default async function PasswordPage() {
  await requireAdmin();
  return <><h1>Actualizar contraseña</h1><form action={changePassword}><label>Nueva contraseña (mínimo 12 caracteres)<input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /></label><button>Guardar y cerrar las sesiones</button></form></>;
}
