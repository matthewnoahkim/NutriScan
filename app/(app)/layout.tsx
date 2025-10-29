import { redirect } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { getSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="flex-1 p-8 bg-background">{children}</main>
    </div>
  );
}

