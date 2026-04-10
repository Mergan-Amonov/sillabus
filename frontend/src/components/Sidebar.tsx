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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Silabuys</h1>
        <p className="text-xs text-gray-500 mt-0.5">Syllabus boshqaruv tizimi</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, roles }) => {
          if (roles && !roles.includes(user?.role ?? "")) return null;
          const isExactMatch = pathname === href;
          const isParentMatch = href !== "/dashboard" && pathname.startsWith(href + "/");
          const active = isExactMatch || isParentMatch;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut size={18} />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
