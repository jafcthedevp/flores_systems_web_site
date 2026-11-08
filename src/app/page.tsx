import { IBM_Plex_Sans } from "next/font/google";
import { AgenticLanding } from "@/components/landing/agentic-landing";
const font = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-agentic",
});
export default function Home() {
  return (
    <div className={font.variable}>
      <AgenticLanding />
    </div>
  );
}
