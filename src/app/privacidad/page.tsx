import Link from "next/link";
export default function PrivacyPage() {
  return (
    <>
      <Link href="/cotizar">← Solicitar cotización</Link>
      <h1>Privacidad de tu solicitud</h1>
      <p>Versión del aviso: 15 de octubre de 2026.</p>
      <p>
        Flores Systems utiliza tu nombre, datos del negocio y vías de contacto
        para responder a esta solicitud, preparar una cotización y dar
        seguimiento a la conversación. Esta autorización no te suscribe a
        campañas.
      </p>
      <p>
        La información se almacena en Supabase y el aviso interno se envía
        mediante Resend. El panel está reservado a la persona administradora.
      </p>
      <p>
        Para consultar, corregir o solicitar la eliminación de tus datos,
        escribe a{" "}
        <a href="mailto:flores.anthony.489@gmail.com">
          flores.anthony.489@gmail.com
        </a>
        .
      </p>
      <p>
        La captación pública se habilitará al completar la revisión del
        responsable, conservación y tratamiento de datos.
      </p>
    </>
  );
}
