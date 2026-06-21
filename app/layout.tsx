import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taiwan Supply Chain Intelligence",
  description: "Free rule-based Taiwan supply-chain intelligence dashboard with no paid APIs."
};

const navItems = [
  { href: "/", label: "Command" },
  { href: "/events", label: "Events" },
  { href: "/companies", label: "Companies" },
  { href: "/doctor", label: "Doctor" },
  { href: "/methodology", label: "Methodology" },
  { href: "/settings", label: "Settings" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="terminal-grid font-sans">
        <div className="min-h-screen border-x border-terminal-line/70 bg-terminal-bg/95">
          <header className="sticky top-0 z-30 border-b border-terminal-line bg-terminal-bg/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <Link href="/" className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-sm bg-terminal-green" />
                <span className="font-mono text-sm uppercase tracking-[0.16em] text-terminal-muted">
                  Taiwan Supply Chain Intelligence
                </span>
              </Link>
              <nav className="flex flex-wrap gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border border-terminal-line px-2.5 py-1 font-mono text-[11px] uppercase text-terminal-muted hover:border-terminal-blue hover:text-terminal-text"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-4">{children}</main>
          <footer className="mx-auto max-w-7xl px-4 pb-6">
            <div className="border border-terminal-line bg-terminal-panel px-3 py-2 font-mono text-[11px] text-terminal-muted">
              本工具僅供研究與教育用途，不構成個人化投資建議。所有推論需自行查證。
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
