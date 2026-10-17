import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Solutions } from "@/components/landing/solutions";
import { Sectors } from "@/components/landing/sectors";
import { Principles } from "@/components/landing/principles";
import { About } from "@/components/landing/about";
import { MotionContent } from "@/components/landing/motion-content";
import { DemoLinks } from "@/components/demos/demo-links";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";
import { AnalyticsEvents } from "@/components/landing/analytics-events";
import { ScrollMotion } from "@/components/landing/scroll-motion";
export default function Home() {
  return (
    <>
      <AnalyticsEvents />
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <Header />
      <ScrollMotion>
        <main id="contenido">
          <Hero />
          <Marquee />
          <Solutions />
          <Sectors />
          <DemoLinks />
          <MotionContent />
          <Principles />
          <About />
          <Contact />
        </main>
      </ScrollMotion>
      <Footer />
    </>
  );
}
