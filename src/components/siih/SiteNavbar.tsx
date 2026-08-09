import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/teams", label: "Teams" },
  { to: "/tasks", label: "Tasks" },
  { to: "/register", label: "Register" },
];

export function SiteNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3" aria-label="SIIH 2.0 home">
          <span
            className="grid h-9 w-9 place-items-center rounded-md font-display text-sm font-bold"
            style={{ background: "var(--gradient-brand)", color: "#02040A", boxShadow: "var(--glow-sm)" }}
          >
            SI
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold tracking-widest">SIIH 2.0</span>
            <span className="block text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Command Center
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild variant="outline" size="sm" className="ml-2">
            <Link to="/auth">Team Login</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-border/60 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link to="/auth" onClick={() => setOpen(false)}>
                Team Login
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
