import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { preload } from "react-dom";
import { AppNav } from "@/components/shell/AppNav";
import { NavigationLoader } from "@/components/shell/NavigationLoader";
import { PointerGlow } from "@/components/shell/PointerGlow";
import { SmoothWheel } from "@/components/shell/SmoothWheel";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: { default: "DevShelf", template: "%s · DevShelf" },
  description: "A personal, visual-first technical library, from first line to internals.",
};

const bootScript = `try{var d=document.documentElement,t=localStorage.getItem('devshelf:theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');d.dataset.theme=t;if(localStorage.getItem('devshelf:nav')==='collapsed')d.dataset.nav='collapsed';var n=navigator,c=n.connection;if(n.deviceMemory<=4||n.hardwareConcurrency<=4||(c&&c.saveData))d.dataset.lite='1'}catch(e){document.documentElement.dataset.theme='light'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Only the roman face is preloaded. Italic is fetched by the browser on pages that use it.
  preload("/fonts/newsreader-roman-v1.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* Kept out of <head>, where browser extensions inject scripts that React would try to hydrate against this one. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: bootScript }} />
        <div className="ambient" aria-hidden="true" />
        <PointerGlow />
        <AppNav />
        <NavigationLoader />
        <SmoothWheel />
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
