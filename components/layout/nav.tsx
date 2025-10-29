"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  Table,
  BarChart3,
  Settings,
  Lightbulb,
  Calendar,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add Entry", icon: PlusCircle },
  { href: "/recommendations", label: "Meal Ideas", icon: Lightbulb },
  { href: "/planner", label: "Meal Plan", icon: Calendar },
  { href: "/intake", label: "Intake Log", icon: Table },
  { href: "/charts", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-card border-r min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">NutriScan</h1>
        <p className="text-sm text-muted-foreground">Nutrition Tracker</p>
      </div>
      <ul className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 pt-8 border-t text-xs text-muted-foreground">
        <p className="mb-2">
          <strong>Disclaimer:</strong> NutriScan provides informational
          estimates only and does not replace professional medical or dietary
          advice.
        </p>
      </div>
    </nav>
  );
}

