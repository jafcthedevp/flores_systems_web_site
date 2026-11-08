import { notFound } from "next/navigation";
import { BusinessDemo } from "@/components/demos/business-demo";
const titles = {
  tienda: "Tienda o bodega",
  veterinaria: "Veterinaria",
  restaurante: "Restaurante",
};
export function generateStaticParams() {
  return Object.keys(titles).map((kind) => ({ kind }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  return {
    title: `Demo de ${titles[kind as keyof typeof titles] || "negocio"}`,
  };
}
export default async function Demo({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!Object.hasOwn(titles, kind)) notFound();
  return <BusinessDemo key={kind} kind={kind as keyof typeof titles} />;
}
