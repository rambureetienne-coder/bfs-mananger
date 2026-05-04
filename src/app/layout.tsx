import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { TaskProvider } from "@/contexts/TaskContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BOMProvider } from "@/contexts/BOMContext";
import { SponsorProvider } from "@/contexts/SponsorContext";
import { ActivityProvider } from "@/contexts/ActivityContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BFS-Manager | Dashboard",
  description: "Formula Student Project Management System",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        <AuthProvider>
          <AuthGuard>
            <ActivityProvider>
              <TaskProvider>
                <BOMProvider>
                  <SponsorProvider>
                    <AppLayout>
                      {children}
                    </AppLayout>
                  </SponsorProvider>
                </BOMProvider>
              </TaskProvider>
            </ActivityProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
