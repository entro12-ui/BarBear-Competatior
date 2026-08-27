import { InstantLink } from "@/components/layout/instant-link";
import { adminLogout } from "@/lib/actions/voting";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/competitions", label: "Competitions" },
  { href: "/admin/competitors", label: "Competitors" },
  { href: "/admin/votes", label: "Votes" },
  { href: "/admin/results", label: "Results" },
];

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <div className="border-b border-border bg-card/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <InstantLink
              href="/admin/dashboard"
              className="font-display text-2xl"
            >
              Barbear Admin
            </InstantLink>
            <nav className="hidden gap-4 md:flex">
              {links.map((link) => (
                <InstantLink
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition hover:text-ink"
                  pendingClassName="text-ink opacity-70"
                >
                  {link.label}
                </InstantLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <InstantLink href="/" className="text-sm text-brass">
              View site
            </InstantLink>
            <form action={adminLogout}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="font-display text-4xl">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
