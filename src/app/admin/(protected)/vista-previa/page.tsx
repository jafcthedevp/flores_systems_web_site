import Link from "next/link";
import { sampleLeads, requirePreview } from "@/lib/server/crm";
import { statuses } from "@/lib/contracts/quote";
export default function Dashboard() {
  requirePreview();
  return (
    <main>
      <h1 className="admin-heading">Oportunidades</h1>
      <p>Una vista del primer contacto al siguiente paso.</p>
      <div className="admin-counts">
        {Object.entries(statuses).map(([key, label]) => (
          <div key={key}>
            <span>{label}</span>
            <strong>
              {sampleLeads.filter((lead) => lead.status === key).length}
            </strong>
          </div>
        ))}
        <div>
          <span>Por seguir</span>
          <strong>
            {
              sampleLeads.filter(
                (lead) => !!lead.followUp && lead.status !== "cerrado",
              ).length
            }
          </strong>
        </div>
      </div>
      <Link className="button button-primary" href="/admin/solicitudes">
        Ver solicitudes
      </Link>
    </main>
  );
}
