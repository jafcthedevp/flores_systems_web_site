'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <><h1>No se pudo completar la operación</h1><p>Reintenta en unos momentos. Si tu sesión caducó, vuelve a iniciar sesión.</p><button onClick={reset}>Reintentar</button><p><a href="/admin/login">Iniciar sesión</a></p></>;
}
