import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donezo",
  description: "Multi-tenant project management SaaS baseline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
