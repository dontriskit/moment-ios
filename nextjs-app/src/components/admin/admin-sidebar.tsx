"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Music, 
  FolderOpen, 
  Trophy, 
  Target, 
  Users,
  LogOut,
  FileText,
  Tags,
  UserCircle,
  Layers,
  Menu,
  X,
  BarChart3,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/admin", label: "Panel główny", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analityka", icon: BarChart3 },
  { href: "/admin/activity", label: "Aktywność", icon: Activity },
  { href: "/admin/activations", label: "Ulepszenia", icon: Music },
  { href: "/admin/categories", label: "Kategorie", icon: FolderOpen },
  { href: "/admin/collections", label: "Kolekcje", icon: Layers },
  { href: "/admin/articles", label: "Artykuły", icon: FileText },
  { href: "/admin/tags", label: "Tagi", icon: Tags },
  { href: "/admin/authors", label: "Autorzy", icon: UserCircle },
  { href: "/admin/challenges", label: "Wyzwania", icon: Target },
  { href: "/admin/achievements", label: "Osiągnięcia", icon: Trophy },
  { href: "/admin/users", label: "Użytkownicy", icon: Users },
];

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Panel Admin</h1>
            <p className="text-xs text-gray-600">Ulepszenia</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-md",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "pt-16 lg:pt-0" // Add padding top for mobile header
        )}
      >
        {/* Desktop Header */}
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Panel administracyjny</h1>
          <p className="text-sm text-gray-600 mt-1">Aplikacja Ulepszenia</p>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 flex-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                  isActive && "bg-gray-100 text-gray-900 border-l-4 border-primary"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || "Administrator"}
            </p>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
          </div>
          <Link
            href="/for-you"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>Powrót do aplikacji</span>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {adminNavItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md text-xs transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}