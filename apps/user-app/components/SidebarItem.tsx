"use client"
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const SidebarItem = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname()
    const selected = pathname === href

    return <div 
        className={`flex items-center gap-3 cursor-pointer py-3.5 pl-8 pr-4 transition-all border-r-2 ${
            selected 
                ? "text-violet-600 bg-violet-50/50 border-violet-600 font-bold" 
                : "text-slate-400 border-transparent hover:text-slate-700 hover:bg-slate-50/50"
        }`} 
        onClick={() => {
            router.push(href);
        }}
    >
        <div className="shrink-0">
            {icon}
        </div>
        <div className="text-sm font-semibold tracking-wide">
            {title}
        </div>
    </div>
}