import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/siih";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);

  return (
    <footer className="border-t border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold tracking-widest text-gradient">
            {settings?.event_name ?? "SIIH 2.0"}
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {settings?.event_subtitle ?? "Smart India Hackathon — Internal Hackathon 2026"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">Navigate</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/register" className="text-muted-foreground hover:text-foreground">
                Register your team
              </Link>
            </li>
            <li>
              <Link to="/teams" className="text-muted-foreground hover:text-foreground">
                Registered teams
              </Link>
            </li>
            <li>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground">
                Team login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {settings?.contact_name ? <li>{settings.contact_name}</li> : null}
            {settings?.contact_phone ? <li>{settings.contact_phone}</li> : null}
            {settings?.contact_email ? <li>{settings.contact_email}</li> : null}
            {!settings?.contact_name && !settings?.contact_phone && !settings?.contact_email ? (
              <li>Contact details will be published soon.</li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {settings?.event_name ?? "SIIH 2.0"}. Ideas today. Impact tomorrow.
      </div>
    </footer>
  );
}
