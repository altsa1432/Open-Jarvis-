import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import AgentConfigProvider from "@/components/AgentConfigProvider";
import AccessibilityApplier from "@/components/AccessibilityApplier";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRUITY — हिन्दी आवाज़ सहायक",
  description: "हिन्दी में सुनने, समझने और बोलने वाली FRUITY आवाज़ सहायक।",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "FRUITY",
  },
};

export const viewport: Viewport = {
  themeColor: "#00a8e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi" className="dark">
      <head>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/png" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-[#030714] text-white antialiased overscroll-none">
        <AgentConfigProvider><AccessibilityApplier />{children}</AgentConfigProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.register("/sw.js").catch(() => {});
            }
            `,
          }}
        />
      </body>
    </html>
  );
}
