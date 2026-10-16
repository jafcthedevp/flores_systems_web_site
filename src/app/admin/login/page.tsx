import { signIn, requestPasswordReset } from "@/app/auth/actions";
import Link from "next/link";
import { AuthButton } from "@/components/admin/auth-form";
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return (
    <>
      <Link href="/">← Flores Systems</Link>
      <h1>Acceso privado</h1>
      {params.error ? (
        <p role="alert">
          No se pudo iniciar sesión. Revisa tus datos o solicita recuperación.
        </p>
      ) : null}
      {params.reset ? (
        <p role="status">
          Si la cuenta está habilitada, recibirás instrucciones. Si cambiaste la
          contraseña, inicia sesión de nuevo.
        </p>
      ) : null}
      <form action={signIn}>
        <label>
          Correo
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        <AuthButton label="Ingresar" />
      </form>
      <details>
        <summary>Recuperar contraseña</summary>
        <form action={requestPasswordReset}>
          <label>
            Correo de acceso
            <input type="email" name="email" required />
          </label>
          <AuthButton label="Solicitar recuperación" />
        </form>
      </details>
    </>
  );
}
