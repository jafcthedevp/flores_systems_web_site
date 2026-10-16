import Link from "next/link";
import { redirect } from "next/navigation";
import { isPreview } from "@/lib/server/crm";
import { currentAdmin } from "@/lib/server/live-crm";
import { signOut } from "@/app/auth/actions";
export const dynamic = "force-dynamic";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const preview = isPreview();
  if (!preview && !(await currentAdmin())) redirect("/admin/login");
  return (
    <div className="admin-shell">
      <nav className="admin-nav" aria-label="Administración">
        <Link href={preview ? "/admin/vista-previa" : "/admin"}>
          Flores Systems
        </Link>
        <Link href="/admin/solicitudes">Solicitudes</Link>
        <Link href="/admin/solicitudes?pending=1">Seguimientos</Link>
        <Link href="/admin/solicitudes/nueva">Crear manual</Link>
        {preview ? (
          <Link href="/admin/login">Salir de la vista previa</Link>
        ) : (
          <form action={signOut}>
            <button className="button button-text">Cerrar sesión</button>
          </form>
        )}
      </nav>
      {preview ? (
        <p className="notice">
          Vista previa de desarrollo: datos ficticios. Los cambios de esta
          pantalla se pierden al salir o recargar. No ingreses datos reales.
        </p>
      ) : null}
      {children}
    </div>
  );
}
