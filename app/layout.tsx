import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Syllabus Importer",
  description: "Transform your syllabus into actionable tasks and calendar events",
  keywords: ["syllabus", "tasks", "calendar", "education", "productivity"],
  authors: [{ name: "Syllabus Team" }],
  openGraph: {
    title: "Syllabus Importer",
    description: "Transform your syllabus into actionable tasks and calendar events",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex h-screen bg-bg">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
