"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ScanLine,
  PlusCircle,
  Table,
  BarChart3,
  Settings,
  Lightbulb,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scan Label", icon: ScanLine },
  { href: "/add", label: "Add Food", icon: PlusCircle },
  { href: "/intake", label: "Intake Table", icon: Table },
  { href: "/charts", label: "Charts", icon: BarChart3 },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
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

