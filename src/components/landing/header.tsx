"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const pendingSectionKey = "flores-systems:pending-section";

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return false;
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
      once: true,
    });
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
  return true;
}

export function Header({ overHero = false }: { overHero?: boolean }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const navigateToSection = (event: { preventDefault(): void }, id: string) => {
    if (document.getElementById(id)) {
      event.preventDefault();
      setOpen(false);
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname + window.location.search,
        );
      }
      scrollToSection(id);
      return;
    }
    // Carry the destination to the home page without adding it to the URL.
    try {
      sessionStorage.setItem(pendingSectionKey, id);
    } catch {
      return;
    }
    event.preventDefault();
    setOpen(false);
    router.push("/", { scroll: false });
  };
  useEffect(() => {
    if (!overHero) return;
    try {
      const id = sessionStorage.getItem(pendingSectionKey);
      if (id && scrollToSection(id)) sessionStorage.removeItem(pendingSectionKey);
    } catch {
      return;
    }
  }, [overHero]);
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
          onNavigate={(event) => navigateToSection(event, "inicio")}
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
          <Link
            href="/#soluciones"
            onNavigate={(event) => navigateToSection(event, "soluciones")}
          >
            Soluciones
          </Link>
          <Link
            href="/#sectores"
            onNavigate={(event) => navigateToSection(event, "sectores")}
          >
            Sectores
          </Link>
          <Link
            href="/#demos"
            onNavigate={(event) => navigateToSection(event, "demos")}
          >
            Demos
          </Link>
          <Link
            href="/#nosotros"
            onNavigate={(event) => navigateToSection(event, "nosotros")}
          >
            Nosotros
          </Link>
          <Link
            className="nav-contact"
            href="/#contacto"
            onNavigate={(event) => navigateToSection(event, "contacto")}
          >
            Solicitar cotización
          </Link>
        </nav>
      </div>
    </header>
  );
}
