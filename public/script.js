const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function closeMenu() {
  if (!menuButton || !siteNav) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
  siteNav.dataset.open = "false";
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  siteNav.dataset.open = String(!isOpen);
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const demos = document.querySelectorAll(".motion-demo[data-demo]");

function playDemo(demo) {
  demo.classList.remove("is-playing");
  // Reinicia la animación al pulsar «Repetir».
  void demo.offsetWidth;
  demo.classList.add("is-playing");
}

if ("IntersectionObserver" in window) {
  const demoObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (!motionPreference.matches) playDemo(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );
  demos.forEach((demo) => demoObserver.observe(demo));
} else if (!motionPreference.matches) {
  demos.forEach(playDemo);
}

document.querySelectorAll("[data-replay]").forEach((button) => {
  button.addEventListener("click", () => {
    const demo = button.closest(".motion-demo");
    if (demo && !motionPreference.matches) playDemo(demo);
  });
});

const tryButton = document.querySelector(".try-button");
const responseSignal = document.querySelector(".response-signal");

tryButton?.addEventListener("click", () => {
  const wasPressed = tryButton.getAttribute("aria-pressed") === "true";
  const pressed = !wasPressed;
  tryButton.setAttribute("aria-pressed", String(pressed));
  tryButton.childNodes[0].textContent = pressed ? "Listo " : "Probar interacción ";
  responseSignal.textContent = pressed ? "Acción confirmada" : "Toca el botón";
});

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
