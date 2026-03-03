import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "IP 内容生成平台",
  description: "帮助 IP 管理内容并生成短视频脚本",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-neutral-50" suppressHydrationWarning>
        <ToastProvider>
          <Navbar />
          <main className="container mx-auto px-6 py-8 max-w-7xl">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
