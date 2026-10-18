"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
export function Header({ overHero = false }: { overHero?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const header = root.current;
    if (!overHero || !header) return;
    const sync = () => {
      header.dataset.scrolled = String(window.scrollY > 24);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [overHero]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    const media = matchMedia("(min-width: 801px)");
    const resize = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", close);
      media.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <header
      ref={root}
      className={overHero ? "site-header site-header-hero" : "site-header"}
    >
      <div className="header-inner wrap">
        <Link
          className="brand"
          href="/#inicio"
          aria-label="Flores Systems, ir al inicio"
        >
          <Image
            src="/img/flores-sys3_nobg.png"
            alt=""
            width={48}
            height={48}
          />
          <span>
            Flores <strong>Systems</strong>
          </span>
        </Link>
        <button
          ref={button}
          className="menu-toggle"
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-controls="site-nav"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>
        <nav
          className="site-nav"
          id="site-nav"
          aria-label="Navegación principal"
          data-open={open}
          onClick={() => setOpen(false)}
        >
          <Link href="/#soluciones">Soluciones</Link>
          <Link href="/#sectores">Sectores</Link>
          <Link href="/#demos">Demos</Link>
          <Link href="/#nosotros">Nosotros</Link>
          <Link className="nav-contact" href="/#contacto">
            Solicitar cotización
          </Link>
        </nav>
      </div>
    </header>
  );
}
