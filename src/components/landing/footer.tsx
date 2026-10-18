import Link from "next/link";
import { ScrollScene } from "./scroll-motion";
export function Footer() {
  return (
    <footer className="site-footer">
      <ScrollScene scene="footer">
        <div className="wrap footer-inner">
          <Link className="brand" href="/">
            Flores <strong>Systems</strong>
          </Link>
          <p>Sitios web y sistemas para negocios en marcha.</p>
          <Link href="/privacidad">Privacidad</Link>
          <span>© {new Date().getFullYear()} Flores Systems</span>
        </div>
      </ScrollScene>
    </footer>
  );
}
