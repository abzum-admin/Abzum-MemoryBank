"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  Settings,
  Activity,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Install Module",
    href: "/install",
    icon: PackagePlus,
  },
  {
    label: "Services",
    href: "/services",
    icon: Boxes,
  },
] as const;

const BOTTOM_ITEMS = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
        active
          ? "bg-accent/10 text-accent shadow-[inset_2px_0_0_hsl(var(--accent))]"
          : "text-text-secondary hover:bg-surface hover:text-text-primary"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
        )}
      />
      <span className="truncate">{label}</span>
      {active && (
        <ChevronRight className="ml-auto h-3.5 w-3.5 text-accent opacity-60" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo / brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/20">
          <Image
            src="/abzum-logo.svg"
            alt="Abzum"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">Abzum</p>
          <p className="truncate text-[11px] text-text-muted">Setup Console</p>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Platform
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border px-2 py-3 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname.startsWith(item.href)}
          />
        ))}

        {/* VPS status pill */}
        <div className="mt-3 flex items-center gap-2 rounded-md bg-surface px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75 pulse-dot" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-success" />
          </span>
          <span className="flex-1 truncate text-[11px] text-text-secondary">VPS online</span>
          <Activity className="h-3 w-3 text-text-muted" />
        </div>
      </div>
    </aside>
  );
}
