import Link from "next/link";
import {
  isPreview,
  listLeads,
  limaDate,
  type LeadFilters,
} from "@/lib/server/crm";
import { currentAdmin, liveList } from "@/lib/server/live-crm";
import { redirect } from "next/navigation";
import { statuses, services } from "@/lib/contracts/quote";
export default async function Requests({
  searchParams,
}: {
  searchParams: Promise<LeadFilters>;
}) {
  const raw = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(raw).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  ) as LeadFilters;
  const preview = isPreview();
  if (!preview && !(await currentAdmin())) redirect("/admin/login");
  const result = preview ? await listLeads(filters) : await liveList(filters);
  const { count, page, pages } = result;
  const rows = result.rows.map((lead) =>
    "contact_name" in lead
      ? {
          id: lead.id,
          name: lead.contact_name,
          business: lead.business_name,
          service: lead.service,
          status: lead.status,
          createdAt: lead.created_at,
          followUp: lead.follow_up_at || "",
        }
      : lead,
  );
  function pageUrl(next: number) {
    const params = new URLSearchParams();
    for (const key of ["q", "status", "from", "to", "pending"] as const)
      if (filters[key]) params.set(key, filters[key]);
    params.set("page", String(next));
    return `/admin/solicitudes?${params}`;
  }
  return (
    <main>
      <h1 className="admin-heading">
        {filters.pending ? "Seguimientos pendientes" : "Solicitudes"}
      </h1>
      <form className="filters" action="/admin/solicitudes">
        {filters.pending ? (
          <input type="hidden" name="pending" value="1" />
        ) : null}
        <label>
          Buscar contacto o negocio
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            maxLength={120}
          />
        </label>
        <label>
          Estado
          <select name="status" defaultValue={filters.status || ""}>
            <option value="">Todos</option>
            {Object.entries(statuses).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Desde (Lima)
          <input name="from" type="date" defaultValue={filters.from} />
        </label>
        <label>
          Hasta (Lima)
          <input name="to" type="date" defaultValue={filters.to} />
        </label>
        <button className="button button-primary">Filtrar</button>
        <Link href="/admin/solicitudes">Limpiar</Link>
      </form>
      <p role="status">{count} solicitud(es)</p>
      <div className="request-list">
        {rows.map((lead) => (
          <article key={lead.id}>
            <div>
              <Link href={`/admin/solicitudes/${lead.id}`}>
                <strong>{lead.name}</strong>
              </Link>
              <p>
                {lead.business}
                <br />
                {services[lead.service]}
                <br />
                {limaDate(lead.createdAt)} (Lima)
              </p>
              {lead.followUp ? (
                <p>Seguimiento: {limaDate(lead.followUp)}</p>
              ) : null}
            </div>
            <span className="badge">{statuses[lead.status]}</span>
          </article>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">
          <h2>No hay solicitudes para estos filtros</h2>
          <p>Prueba otra búsqueda o limpia los filtros.</p>
          <Link href="/admin/solicitudes">Ver todas</Link>
        </div>
      ) : null}
      <nav className="pagination" aria-label="Paginación">
        {page > 1 ? <Link href={pageUrl(page - 1)}>Anterior</Link> : <span />}
        <span>
          Página {page} de {pages}
        </span>
        {page < pages ? (
          <Link href={pageUrl(page + 1)}>Siguiente</Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
