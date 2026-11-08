import { IBM_Plex_Sans } from "next/font/google";
const font = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-agentic",
});
export default function DemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={font.variable}>{children}</div>;
}
