import Link from 'next/link';
export default function Denied() { return <main className="utility-page"><h1>Acceso denegado</h1><p>Esta sección requiere una cuenta administradora autorizada.</p><Link href="/admin/login">Volver al acceso</Link></main>; }
