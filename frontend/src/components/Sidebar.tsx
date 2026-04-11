"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut, Plus, Settings, User, Users } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard, roles: null },
  { href: "/dashboard/syllabuses", label: "Syllabuslar", icon: BookOpen, roles: null },
  { href: "/dashboard/syllabuses/new", label: "Yangi syllabus", icon: Plus, roles: null },
  { href: "/dashboard/users", label: "Foydalanuvchilar", icon: Users, roles: ["super_admin"] },
  { href: "/dashboard/settings", label: "Sozlamalar", icon: Settings, roles: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 flex flex-col h-screen fixed top-0 left-0" style={{ backgroundColor: "#0F3460" }}>
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <h1 className="text-lg font-extrabold tracking-tight" style={{ color: "#fff" }}>
          Silabus<span style={{ color: "#D97706" }}>.uz</span>
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          Syllabus boshqaruv tizimi
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, roles }) => {
          if (roles && !roles.includes(user?.role ?? "")) return null;
          const isExactMatch = pathname === href;
          const isParentMatch = href !== "/dashboard" && pathname.startsWith(href + "/");
          const active = isExactMatch || isParentMatch;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? "#0E7490" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.68)",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <Icon size={16} style={{ opacity: active ? 1 : 0.75, flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#0E7490" }}
          >
            <User size={15} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#fff" }}>{user?.full_name}</p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
