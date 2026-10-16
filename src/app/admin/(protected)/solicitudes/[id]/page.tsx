import { notFound } from "next/navigation";
import { isPreview, requirePreview, sampleLeads } from "@/lib/server/crm";
import { LeadDetail } from "@/components/admin/lead-detail";
import { currentAdmin, type LiveLead } from "@/lib/server/live-crm";
import { getRequest } from "@/lib/data/requests";
import {
  LiveDetail,
  type Note,
  type History,
  type Notification,
} from "@/components/admin/live-detail";
import { redirect } from "next/navigation";
import { z } from "zod";
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isPreview()) {
    if (!(await currentAdmin())) redirect("/admin/login");
    if (!z.uuid().safeParse(id).success) notFound();
    const detail = await getRequest(id);
    if (!detail.request) notFound();
    return (
      <LiveDetail
        lead={detail.request as LiveLead}
        notes={detail.notes as Note[]}
        history={detail.history as History[]}
        notifications={detail.notifications as Notification[]}
      />
    );
  }
  requirePreview();
  const lead = sampleLeads.find((item) => item.id === id);
  if (!lead) notFound();
  return <LeadDetail lead={lead} />;
}
