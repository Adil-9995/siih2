import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { StatusBadge } from "@/components/siih/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiihIdentity, useMyTeam, useSupabaseSession } from "@/hooks/useSiih";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Portal | SIIH 2.0" },
      { name: "description", content: "Your SIIH 2.0 team dashboard: registration status, payment and tasks." },
      { property: "og:title", content: "Team Portal | SIIH 2.0" },
      { property: "og:description", content: "Track your SIIH 2.0 registration, payment and task progress." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeamPortal,
});

function TeamPortal() {
  const { session, loading } = useSupabaseSession();
  const { data: identity, isLoading: identityLoading } = useSiihIdentity(!!session);
  const { data: team, isLoading: teamLoading } = useMyTeam(identity?.team_id);

  if (loading || identityLoading) {
    return (
      <Shell>
        <Skeleton className="h-40 w-full rounded-xl" />
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <div className="glass rounded-2xl p-10 text-center">
          <h1 className="font-display text-2xl font-bold">Sign in required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with your registered team leader Gmail to open the team portal.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth">Team login</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  if (!identity?.team_id) {
    return (
      <Shell>
        <div className="glass rounded-2xl p-10 text-center">
          <h1 className="font-display text-2xl font-bold">No team linked to this account</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We couldn't find a registration for {session.user.email}. Register your team, or sign in with the exact
            email used during registration.
          </p>
          <Button asChild className="mt-6">
            <Link to="/register">Register a team</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {teamLoading || !team ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <>
          <div className="glass rounded-2xl p-7" style={{ boxShadow: "var(--glow-sm)" }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Team</p>
                <h1 className="mt-1 font-display text-3xl font-bold">{team.team_name}</h1>
                <p className="mt-1 font-mono text-sm text-cyan">{team.registration_id}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={team.status} />
                <StatusBadge status={team.payment_status} />
              </div>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              {team.college} · {team.department}
            </p>
          </div>

          <div className="glass mt-6 rounded-2xl p-7">
            <h2 className="font-display text-xl">Tasks & submissions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tasks unlock once your payment is verified. You'll be notified here as soon as a round is released.
            </p>
          </div>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <CyberBackground subtle />
      <SiteNavbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">{children}</main>
    </div>
  );
}
