"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  Package,
  MessageSquare,
  Heart,
  Star,
  BarChart3,
  LogOut,
} from "lucide-react";

const menuItems = [
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Package, label: "Sample Records", href: "/profile/samples" },
  { icon: MessageSquare, label: "Message Center", href: "/profile/messages" },
  { icon: Heart, label: "My Collection", href: "/profile/collection" },
  { icon: Star, label: "My Showcase", href: "/profile/showcase" },
  { icon: BarChart3, label: "Earnings Analysis", href: "/commissions" },
];

export default function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#ff6b6b]/10 text-[#ff6b6b]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
