import Link from "next/link";
export function AdminShortcuts() {
  return (
    <nav className="admin-actions" aria-label="Seguimiento de solicitudes">
      <Link className="button button-primary" href="/admin/solicitudes">
        Abrir panel de seguimiento
      </Link>
      <Link className="button button-text" href="/admin/solicitudes/nueva">
        Registrar contacto manual
      </Link>
    </nav>
  );
}
