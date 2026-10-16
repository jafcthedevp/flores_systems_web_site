import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/header";
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
  return (
    <>
      <Header />
      <main className="wrap demo-page">
        <Link href="/#demos">Volver a las demos</Link>
        <h1>{titles[kind as keyof typeof titles]}</h1>
        <p className="notice">
          Demostración de Flores Systems. Todos los datos son ficticios; las
          acciones se reinician al recargar.
        </p>
        <BusinessDemo kind={kind as keyof typeof titles} />
        <div className="demo-cta">
          <h2>¿Te serviría algo así?</h2>
          <p>Adaptamos la propuesta a la forma de trabajar de tu negocio.</p>
          <Link className="button button-primary" href="/#contacto">
            Solicitar cotización
          </Link>
        </div>
      </main>
    </>
  );
}
