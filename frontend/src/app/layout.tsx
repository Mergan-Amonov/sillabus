import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silabuys — Aqlli Syllabus Platformasi",
  description: "Universitet syllabus boshqaruv tizimi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
