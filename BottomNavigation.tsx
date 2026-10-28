"use client";

import React from "react";
import { Home, MessageSquare, Mic, Sparkles, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "घर", icon: Home, href: "/" },
  { label: "बात", icon: MessageSquare, href: "/chat" },
  { label: "आवाज़", icon: Mic, href: "/voice" },
  { label: "यादें", icon: Sparkles, href: "/memories" },
  { label: "पसंद", icon: Settings, href: "/settings" },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="मुख्य रास्ते" className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-[#060b14]/90 px-1 pb-[max(env(safe-area-inset-bottom),.25rem)] pt-2 backdrop-blur-xl md:bottom-4 md:left-4 md:right-4 md:mx-auto md:max-w-sm md:rounded-3xl md:border md:border-white/10 md:px-3">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition ${active ? "text-cyan-200" : "text-slate-500 hover:text-slate-300"}`}><item.icon size={19} strokeWidth={1.8} /><span className="text-[10px] font-medium">{item.label}</span></Link>;
      })}
    </nav>
  );
}
