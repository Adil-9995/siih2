import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { StatusBadge } from "@/components/siih/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/siih";
import { useSiihIdentity, useSupabaseSession } from "@/hooks/useSiih";
import { ScanTab } from "./admin";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer Desk | SIIH 2.0" },
      { name: "description", content: "Scan SIIH 2.0 venue passes and view every team assigned to your venue." },
      { property: "og:title", content: "Volunteer Desk | SIIH 2.0" },
      { property: "og:description", content: "Check teams in at your venue and track attendance for SIIH 2.0." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VolunteerPage,
});

function VolunteerPage() {
  const { session, loading } = useSupabaseSession();
  const { data: identity, isLoading: identityLoading } = useSiihIdentity(!!session);

  const allowed = Boolean(identity?.isVolunteer || identity?.isAdmin);

  const teams = useQuery({
    queryKey: ["volunteer-teams"],
    enabled: allowed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, team_name, registration_id, leader_name, leader_phone, college, status, payment_status, venue_id")
        .order("team_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const venues = useQuery({
    queryKey: ["volunteer-venues"],
    enabled: allowed,
    queryFn: async () => {
      const { data, error } = await supabase.from("venues").select("id, name, room").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const checkins = useQuery({
    queryKey: ["volunteer-checkins"],
    enabled: allowed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue_checkins")
        .select("id, team_id, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || identityLoading) {
    return (
      <Shell>
        <Skeleton className="h-48 w-full rounded-xl" />
      </Shell>
    );
  }

  if (!session || !allowed) {
    return (
      <Shell>
        <div className="glass rounded-2xl p-10 text-center">
          <h1 className="font-display text-2xl font-bold">Volunteer access required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with the account the organisers assigned to your venue.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth">Go to login</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const venueName = (id: string | null) => {
    const v = venues.data?.find((x) => x.id === id);
    return v ? `${v.name}${v.room ? ` · ${v.room}` : ""}` : "Unassigned";
  };
  const lastCheckin = (teamId: string) => checkins.data?.find((c) => c.team_id === teamId)?.created_at ?? null;

  return (
    <Shell>
      <div className="glass rounded-2xl p-7" style={{ boxShadow: "var(--glow-sm)" }}>
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Volunteer desk</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Venue check-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Scan a team's venue pass to record their arrival. Only teams assigned to your venue can be checked in.
        </p>
      </div>

      <Tabs defaultValue="scan" className="mt-6">
        <TabsList>
          <TabsTrigger value="scan">Scan pass</TabsTrigger>
          <TabsTrigger value="teams">My venue teams</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="pt-6">
          <ScanTab />
        </TabsContent>

        <TabsContent value="teams" className="pt-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl">Teams at your venue</h2>
            {teams.isLoading ? (
              <Skeleton className="mt-4 h-32 w-full rounded-lg" />
            ) : (teams.data?.length ?? 0) === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No teams are assigned to your venue yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs tracking-wider text-muted-foreground uppercase">
                    <tr>
                      <th className="py-2 pr-4">Team</th>
                      <th className="py-2 pr-4">Leader</th>
                      <th className="py-2 pr-4">Venue</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Checked in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.data?.map((t) => (
                      <tr key={t.id} className="border-t border-border/60">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{t.team_name}</p>
                          <p className="font-mono text-xs text-cyan">{t.registration_id}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <p>{t.leader_name}</p>
                          <p className="text-xs text-muted-foreground">{t.leader_phone}</p>
                        </td>
                        <td className="py-3 pr-4 text-xs">{venueName(t.venue_id)}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">
                          {lastCheckin(t.id) ? formatDate(lastCheckin(t.id)) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <CyberBackground subtle />
      <SiteNavbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">{children}</main>
    </div>
  );
}
