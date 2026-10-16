import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth/admin";
import { listRequests, getCounters } from "@/lib/data/requests";
import { signOut } from "@/app/auth/actions";
import { STATUSES, SOURCES } from "@/lib/contracts/quote-requests";
import { AdminShortcuts } from "@/components/admin/admin-shortcuts";
import { statuses, origins } from "@/lib/contracts/quote";
export const dynamic = "force-dynamic";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!(await getAdmin())) redirect("/admin/login");
  const params = await searchParams;
  const [list, counters] = await Promise.all([
    listRequests({
      page: params.page ?? "1",
      status: params.status || undefined,
      source: params.source || undefined,
      search: params.search ?? "",
    }),
    getCounters(),
  ]);
  const next = new URLSearchParams(
    Object.entries(params).filter(
      (e): e is [string, string] => typeof e[1] === "string",
    ),
  );
  next.set("page", String(list.page + 1));
  return (
    <>
      <nav>
        <Link href="/">Flores Systems</Link>
        <Link href="/admin/solicitudes/nueva">Nueva oportunidad</Link>
      </nav>
      <h1>Solicitudes</h1>
      <AdminShortcuts />
      <p>
        {Object.entries(counters ?? {})
          .map(
            ([key, value]) =>
              `${({ ...statuses, seguimientos_pendientes: "Seguimientos pendientes" } as Record<string, string>)[key] || key}: ${value}`,
          )
          .join(" · ")}
      </p>
      <form>
        <label>
          Buscar contacto o negocio
          <input name="search" defaultValue={params.search} maxLength={120} />
        </label>
        <label>
          Estado
          <select name="status" defaultValue={params.status}>
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statuses[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Origen
          <select name="source" defaultValue={params.source}>
            <option value="">Todos</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {origins[s]}
              </option>
            ))}
          </select>
        </label>
        <button>Filtrar</button>
      </form>
      <p>{list.count} oportunidades</p>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Contacto</th>
              <th>Negocio</th>
              <th>Estado</th>
              <th>Origen</th>
            </tr>
          </thead>
          <tbody>
            {list.rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/solicitudes/${r.id}`}>
                    {r.contact_name}
                  </Link>
                </td>
                <td>{r.business_name}</td>
                <td>
                  {statuses[r.status as keyof typeof statuses] || r.status}
                </td>
                <td>{origins[r.source as keyof typeof origins] || r.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.page * list.pageSize < list.count ? (
        <Link href={`/admin?${next}`}>Siguiente página →</Link>
      ) : null}
      {list.page > 1 ? (
        <p>
          <Link
            href={`/admin?${new URLSearchParams({ ...Object.fromEntries(next), page: String(list.page - 1) })}`}
          >
            ← Anterior
          </Link>
        </p>
      ) : null}
      <form action={signOut}>
        <button>Cerrar sesión</button>
      </form>
    </>
  );
}
