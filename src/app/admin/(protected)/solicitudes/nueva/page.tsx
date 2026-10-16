import { isPreview } from "@/lib/server/crm";
import { currentAdmin } from "@/lib/server/live-crm";
import { redirect } from "next/navigation";
import { ManualLead } from "@/components/admin/manual-lead";
export default async function NewLead() {
  const preview = isPreview();
  if (!preview && !(await currentAdmin())) redirect("/admin/login");
  return (
    <main>
      <h1 className="admin-heading">Registrar contacto manual</h1>
      <ManualLead preview={preview} />
    </main>
  );
}
