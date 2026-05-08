import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EC Platform — CHIAC ASI",
  description: "Energy Credit contribution economy for the Superintelligence Edge Project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
