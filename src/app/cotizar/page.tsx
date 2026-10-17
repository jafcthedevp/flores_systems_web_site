import { randomUUID } from "node:crypto";
import Link from "next/link";
import QuoteForm from "./quote-form";
export const dynamic = "force-dynamic";
export default function QuotePage() {
  return (
    <>
      <Link href="/">← Flores Systems</Link>
      <h1>Cuéntanos qué necesita tu negocio</h1>
      <p>
        Revisaremos tu solicitud y te contactaremos por el canal que elijas.
      </p>
      <QuoteForm idempotencyKey={randomUUID()} />
    </>
  );
}
