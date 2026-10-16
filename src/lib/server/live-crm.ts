import "server-only";
import { z } from "zod";
import { getAdmin, requireAdmin } from "@/lib/auth/admin";
import { STATUSES, type QuoteInput } from "@/lib/contracts/quote-requests";
export type LiveLead = Omit<
  QuoteInput,
  "consent" | "website" | "idempotency_key"
> & {
  id: string;
  reference: string;
  status: (typeof STATUSES)[number];
  source: string;
  created_at: string;
  follow_up_at: string | null;
  quoted_at: string | null;
  quoted_amount: string | null;
  outcome: "ganado" | "perdido" | "desistido" | null;
  close_reason: string | null;
  version: number;
};
export async function currentAdmin() {
  try {
    return await getAdmin();
  } catch {
    return null;
  }
}
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();
const filtersSchema = z.object({
  q: z.string().max(120).default(""),
  status: z.enum(STATUSES).optional().catch(undefined),
  from: date.catch(undefined),
  to: date.catch(undefined),
  pending: z.literal("1").optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100000).default(1).catch(1),
});
export async function liveList(input: unknown) {
  const { client } = await requireAdmin();
  const parsed = filtersSchema.safeParse(input);
  const f = parsed.success ? parsed.data : filtersSchema.parse({});
  let query = client
    .from("quote_requests")
    .select(
      "id,reference,contact_name,business_name,service,status,created_at,follow_up_at",
      { count: "exact" },
    );
  const q = f.q.replace(/[^\p{L}\p{N}@+ .-]/gu, "").trim();
  if (q)
    query = query.or(
      ["contact_name", "business_name", "email", "phone"]
        .map((key) => `${key}.ilike.%${q}%`)
        .join(","),
    );
  if (f.status) query = query.eq("status", f.status);
  if (f.from) query = query.gte("created_at", `${f.from}T00:00:00-05:00`);
  if (f.to) query = query.lte("created_at", `${f.to}T23:59:59.999-05:00`);
  if (f.pending)
    query = query
      .neq("status", "cerrado")
      .not("follow_up_at", "is", null)
      .lte("follow_up_at", new Date().toISOString());
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((f.page - 1) * 25, f.page * 25 - 1);
  if (error) throw new Error("No se pudieron consultar las solicitudes.");
  return {
    rows: (data || []) as Pick<
      LiveLead,
      | "id"
      | "reference"
      | "contact_name"
      | "business_name"
      | "service"
      | "status"
      | "created_at"
      | "follow_up_at"
    >[],
    count: count || 0,
    page: f.page,
    pages: Math.max(1, Math.ceil((count || 0) / 25)),
  };
}
