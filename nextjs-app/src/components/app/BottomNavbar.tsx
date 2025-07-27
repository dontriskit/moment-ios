"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/for-you", label: "Dla Ciebie", icon: Home },
  { href: "/explore", label: "Odkrywaj", icon: Search },
  { href: "/playlists", label: "Playlisty", icon: Library },
  { href: "/challenges", label: "Wyzwania", icon: Shield },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "fill-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}