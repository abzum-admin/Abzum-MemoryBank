import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abzum Setup",
  description: "Deploy and manage Abzum infrastructure modules on this VPS",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
