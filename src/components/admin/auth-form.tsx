"use client";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  signIn,
  requestPasswordReset,
  changePassword,
} from "@/app/auth/actions";
export function AuthButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="button button-primary" disabled={pending}>
      {pending ? "Procesando…" : label}
    </button>
  );
}
export function AuthForm({
  mode,
  preview = false,
}: {
  mode: "login" | "recover" | "reset";
  preview?: boolean;
}) {
  const action =
    mode === "login"
      ? signIn
      : mode === "recover"
        ? requestPasswordReset
        : changePassword;
  return (
    <main className="utility-page">
      <Link href="/">Flores Systems</Link>
      <div className="auth-panel">
        <h1>
          {mode === "login"
            ? "Acceso privado"
            : mode === "recover"
              ? "Recuperar contraseña"
              : "Nueva contraseña"}
        </h1>
        <form action={action} className="form-panel stack">
          {mode !== "reset" ? (
            <label htmlFor="auth-email">
              Correo
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
          ) : null}
          {mode !== "recover" ? (
            <label htmlFor="auth-password">
              {mode === "reset" ? "Nueva contraseña" : "Contraseña"}
              <input
                id="auth-password"
                name="password"
                type="password"
                required
                minLength={mode === "reset" ? 12 : 1}
                maxLength={128}
                autoComplete={
                  mode === "reset" ? "new-password" : "current-password"
                }
              />
            </label>
          ) : (
            <p className="form-hint">
              Si la cuenta está habilitada, recibirás instrucciones por correo.
            </p>
          )}
          <AuthButton
            label={
              mode === "login"
                ? "Entrar"
                : mode === "recover"
                  ? "Solicitar enlace"
                  : "Guardar contraseña"
            }
          />
        </form>
        <div className="admin-actions">
          <Link href="/admin/login">Iniciar sesión</Link>
          <Link href="/admin/recuperar">Recuperar contraseña</Link>
        </div>
        {preview ? (
          <Link className="button button-text" href="/admin/vista-previa">
            Abrir vista previa con datos ficticios
          </Link>
        ) : null}
      </div>
    </main>
  );
}
