import Link from "next/link";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Link className="brand" href="/">
          Flores <strong>Systems</strong>
        </Link>
        <p>Sitios web y sistemas para negocios en marcha.</p>
        <Link href="/privacidad">Privacidad</Link>
        <span>© {new Date().getFullYear()} Flores Systems</span>
      </div>
    </footer>
  );
}
