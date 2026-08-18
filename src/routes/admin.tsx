import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { StatusBadge } from "@/components/siih/StatusBadge";
import { QrScanner } from "@/components/siih/QrScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, logAudit, settingsQuery, type Settings } from "@/lib/siih";
import { useSiihIdentity, useSupabaseSession } from "@/hooks/useSiih";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Organiser Console | SIIH 2.0" },
      { name: "description", content: "SIIH 2.0 organiser console for teams, venues, tasks and passes." },
      { property: "og:title", content: "Organiser Console | SIIH 2.0" },
      { property: "og:description", content: "Manage SIIH 2.0 registrations, venues, staff and tasks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <CyberBackground subtle />
      <SiteNavbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}

function AdminPage() {
  const { session, loading } = useSupabaseSession();
  const { data: identity, isLoading } = useSiihIdentity(!!session);

  if (loading || isLoading) {
    return (
      <Shell>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </Shell>
    );
  }

  if (!session || !identity?.isAdmin) {
    return (
      <Shell>
        <div className="glass rounded-2xl p-10 text-center">
          <h1 className="font-display text-2xl font-bold">Organiser access only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with an admin or co-admin account to open the console.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth">Staff login</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const isSuper = identity.role === "super_admin";

  return (
    <Shell>
      <header className="glass rounded-2xl p-6" style={{ boxShadow: "var(--glow-sm)" }}>
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Console</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Organiser command center</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {session.user.email} · {identity.role.replace("_", " ")}
        </p>
      </header>

      <Tabs defaultValue="event" className="mt-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="event">Event</TabsTrigger>
          <TabsTrigger value="content">Rules & rounds</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="scan">Scan pass</TabsTrigger>
        </TabsList>

        <TabsContent value="event" className="pt-6">
          <EventTab />
        </TabsContent>
        <TabsContent value="content" className="pt-6">
          <ContentTab />
        </TabsContent>
        <TabsContent value="teams" className="pt-6">
          <TeamsTab />
        </TabsContent>
        <TabsContent value="staff" className="pt-6">
          <StaffTab isSuper={isSuper} />
        </TabsContent>
        <TabsContent value="venues" className="pt-6">
          <VenuesTab />
        </TabsContent>
        <TabsContent value="tasks" className="pt-6">
          <TasksTab />
        </TabsContent>
        <TabsContent value="scan" className="pt-6">
          <ScanTab />
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

/* ---------------- helpers ---------------- */

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Converts an ISO timestamp to a value usable by <input type="datetime-local">. */
function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function useSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { data: current, error: readErr } = await supabase
        .from("hackathon_settings")
        .select("id")
        .limit(1)
        .single();
      if (readErr) throw readErr;
      const { error } = await supabase
        .from("hackathon_settings")
        .update(patch as never)
        .eq("id", current.id);
      if (error) throw error;
      await logAudit("settings.update", "hackathon_settings", current.id, patch);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Saved.");
    },
    onError: (e: Error) => toast.error(e.message || "Could not save."),
  });
}

/* ---------------- event tab ---------------- */

function EventTab() {
  const { data: settings } = useQuery(settingsQuery);
  const save = useSettingsMutation();
  const [form, setForm] = useState<Partial<Settings>>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!settings) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const set = (k: keyof Settings, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <Panel title="Access switches" description="Open or close registration, login and submissions instantly.">
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["registration_open", "Registration open"],
              ["login_open", "Login open"],
              ["submissions_open", "Submissions open"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-border p-4">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={Boolean(form[key])}
                onCheckedChange={(v) => {
                  set(key, v);
                  save.mutate({ [key]: v });
                }}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Important dates" description="Shown on the landing page countdowns.">
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["registration_deadline", "Registration deadline"],
              ["start_at", "Hackathon begins"],
              ["end_at", "Hackathon ends"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="datetime-local"
                className="mt-1.5"
                value={toLocalInput(form[key] as string)}
                onChange={(e) => set(key, new Date(e.target.value).toISOString())}
              />
            </div>
          ))}
        </div>
        <Button
          className="mt-5"
          disabled={save.isPending}
          onClick={() =>
            save.mutate({
              registration_deadline: form.registration_deadline,
              start_at: form.start_at,
              end_at: form.end_at,
            })
          }
        >
          Save dates
        </Button>
      </Panel>

      <Panel title="Coordinator" description="Contact details shown across the site.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="contact_name">Name</Label>
            <Input
              id="contact_name"
              className="mt-1.5"
              value={form.contact_name ?? ""}
              onChange={(e) => set("contact_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Phone</Label>
            <Input
              id="contact_phone"
              className="mt-1.5"
              value={form.contact_phone ?? ""}
              onChange={(e) => set("contact_phone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contact_email">Email</Label>
            <Input
              id="contact_email"
              type="email"
              className="mt-1.5"
              value={form.contact_email ?? ""}
              onChange={(e) => set("contact_email", e.target.value)}
            />
          </div>
        </div>
        <Button
          className="mt-5"
          disabled={save.isPending}
          onClick={() =>
            save.mutate({
              contact_name: form.contact_name,
              contact_phone: form.contact_phone,
              contact_email: form.contact_email,
            })
          }
        >
          Save coordinator
        </Button>
      </Panel>

      <Panel title="Team size & fee">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="team_min_size">Minimum members</Label>
            <Input
              id="team_min_size"
              type="number"
              className="mt-1.5"
              value={form.team_min_size ?? 6}
              onChange={(e) => set("team_min_size", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="team_max_size">Maximum members</Label>
            <Input
              id="team_max_size"
              type="number"
              className="mt-1.5"
              value={form.team_max_size ?? 6}
              onChange={(e) => set("team_max_size", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="registration_fee">Registration fee (INR)</Label>
            <Input
              id="registration_fee"
              type="number"
              className="mt-1.5"
              value={form.registration_fee ?? 0}
              onChange={(e) => set("registration_fee", Number(e.target.value))}
            />
          </div>
        </div>
        <Button
          className="mt-5"
          disabled={save.isPending}
          onClick={() =>
            save.mutate({
              team_min_size: form.team_min_size,
              team_max_size: form.team_max_size,
              registration_fee: form.registration_fee,
            })
          }
        >
          Save
        </Button>
      </Panel>
    </div>
  );
}

/* ---------------- content tab ---------------- */

function ContentTab() {
  const { data: settings } = useQuery(settingsQuery);
  const save = useSettingsMutation();
  const [rules, setRules] = useState("");
  const [rounds, setRounds] = useState("");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!settings) return;
    setRules(settings.rules_text ?? "");
    setRounds(settings.rounds_text ?? "");
    setAnnouncement(settings.announcement ?? "");
  }, [settings]);

  if (!settings) return <Skeleton className="h-64 w-full rounded-2xl" />;

  return (
    <div className="space-y-6">
      <Panel title="Read before registering" description="Team requirements & rules shown on the register page.">
        <Textarea rows={10} value={rules} onChange={(e) => setRules(e.target.value)} />
        <Button className="mt-4" disabled={save.isPending} onClick={() => save.mutate({ rules_text: rules })}>
          Save rules
        </Button>
      </Panel>
      <Panel title="Task rounds" description="Explanation of how rounds, work windows and evaluation work.">
        <Textarea rows={10} value={rounds} onChange={(e) => setRounds(e.target.value)} />
        <Button className="mt-4" disabled={save.isPending} onClick={() => save.mutate({ rounds_text: rounds })}>
          Save rounds
        </Button>
      </Panel>
      <Panel title="Site announcement" description="Leave empty to hide the banner.">
        <Textarea rows={3} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
        <Button
          className="mt-4"
          disabled={save.isPending}
          onClick={() => save.mutate({ announcement: announcement.trim() || null })}
        >
          Save announcement
        </Button>
      </Panel>
    </div>
  );
}

/* ---------------- teams tab ---------------- */

type TeamRow = {
  id: string;
  registration_id: string | null;
  team_name: string;
  leader_name: string;
  leader_email: string;
  college: string;
  department: string;
  status: string;
  payment_status: string;
  venue_id: string | null;
  pass_code: string | null;
};

function useTeams() {
  return useQuery({
    queryKey: ["admin-teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(
          "id,registration_id,team_name,leader_name,leader_email,college,department,status,payment_status,venue_id,pass_code",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TeamRow[];
    },
  });
}

function useVenues() {
  return useQuery({
    queryKey: ["admin-venues"],
    queryFn: async () => {
      const { data, error } = await supabase.from("venues").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

const REG_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "payment_pending",
  "payment_verification",
  "verified",
  "rejected",
  "cancelled",
  "suspended",
] as const;

const PAY_STATUSES = ["pending", "under_review", "verified", "rejected"] as const;

function TeamsTab() {
  const qc = useQueryClient();
  const { data: teams, isLoading } = useTeams();
  const { data: venues } = useVenues();
  const [q, setQ] = useState("");

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("teams")
        .update(patch as never)
        .eq("id", id);
      if (error) throw error;
      await logAudit("team.update", "teams", id, patch);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-teams"] });
      toast.success("Team updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return teams ?? [];
    return (teams ?? []).filter((t) =>
      [t.team_name, t.registration_id, t.leader_email, t.college].some((v) =>
        (v ?? "").toLowerCase().includes(needle),
      ),
    );
  }, [teams, q]);

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  return (
    <Panel title="Registered teams" description="Verify registrations, payments and assign venues.">
      <Input
        placeholder="Search team, ID, leader email or college"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-md"
      />
      <div className="mt-5 space-y-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teams found.</p>
        ) : null}
        {filtered.map((t) => (
          <div key={t.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold">{t.team_name}</p>
                <p className="font-mono text-xs text-cyan">{t.registration_id ?? "—"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.leader_name} · {t.leader_email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.college} · {t.department}
                </p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={t.status} />
                <StatusBadge status={t.payment_status} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Registration status</Label>
                <Select value={t.status} onValueChange={(v) => update.mutate({ id: t.id, patch: { status: v } })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REG_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Payment status</Label>
                <Select
                  value={t.payment_status}
                  onValueChange={(v) => update.mutate({ id: t.id, patch: { payment_status: v } })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Venue</Label>
                <Select
                  value={t.venue_id ?? "none"}
                  onValueChange={(v) => update.mutate({ id: t.id, patch: { venue_id: v === "none" ? null : v } })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {(venues ?? []).map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                        {v.room ? ` · ${v.room}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground">Pass code: {t.pass_code ?? "—"}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------- staff tab ---------------- */

function StaffTab({ isSuper }: { isSuper: boolean }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("co_admin");

  const invites = useQuery({
    queryKey: ["staff-invites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_invites").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const directory = useQuery({
    queryKey: ["staff-directory"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("staff_directory");
      if (error) throw error;
      return (data ?? []) as Array<{ user_id: string; email: string; full_name: string; role: string }>;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("staff_invites").insert({
        email: email.trim().toLowerCase(),
        full_name: fullName.trim() || null,
        role: role as never,
      });
      if (error) throw error;
      await logAudit("staff.invite", "staff_invites", undefined, { email, role });
    },
    onSuccess: async () => {
      setEmail("");
      setFullName("");
      await qc.invalidateQueries({ queryKey: ["staff-invites"] });
      toast.success("Staff member invited. They get access on their next sign-in.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staff_invites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["staff-invites"] });
      toast.success("Invite removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Panel title="Add co-admin or volunteer" description="Invite by email — access applies the next time they sign in.">
        <form
          className="grid gap-3 sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <div className="sm:col-span-2">
            <Label htmlFor="staff-invite-email">Email</Label>
            <Input
              id="staff-invite-email"
              type="email"
              required
              className="mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="staff-invite-name">Name</Label>
            <Input
              id="staff-invite-name"
              className="mt-1.5"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="co_admin">Co-admin</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="evaluator">Evaluator</SelectItem>
                {isSuper ? <SelectItem value="admin">Admin</SelectItem> : null}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="sm:col-span-4 sm:w-fit" disabled={add.isPending}>
            Add staff member
          </Button>
        </form>
      </Panel>

      <Panel title="Pending & active invites">
        <div className="space-y-2">
          {(invites.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No invites yet.</p>
          ) : null}
          {(invites.data ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">{i.email}</p>
                <p className="text-xs text-muted-foreground">
                  {i.full_name ?? "—"} · {String(i.role).replace("_", " ")}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => remove.mutate(i.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Staff with active accounts">
        <div className="space-y-2">
          {(directory.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff have signed in yet.</p>
          ) : null}
          {(directory.data ?? []).map((s) => (
            <div key={`${s.user_id}-${s.role}`} className="rounded-lg border border-border px-4 py-3">
              <p className="text-sm font-medium">{s.email}</p>
              <p className="text-xs text-muted-foreground">
                {s.full_name ?? "—"} · {s.role.replace("_", " ")}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- venues tab ---------------- */

function VenuesTab() {
  const qc = useQueryClient();
  const { data: venues } = useVenues();
  const { data: teams } = useTeams();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState("");
  const [volEmail, setVolEmail] = useState<Record<string, string>>({});

  const assignments = useQuery({
    queryKey: ["venue-volunteers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("venue_volunteers").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const createVenue = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("venues").insert({
        name: name.trim(),
        room: room.trim() || null,
        capacity: capacity ? Number(capacity) : null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setName("");
      setRoom("");
      setCapacity("");
      await qc.invalidateQueries({ queryKey: ["admin-venues"] });
      toast.success("Venue created.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteVenue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venues").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-venues"] });
      toast.success("Venue removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addVolunteer = useMutation({
    mutationFn: async (venueId: string) => {
      const mail = (volEmail[venueId] ?? "").trim().toLowerCase();
      if (!mail) throw new Error("Enter a volunteer email.");
      const { error } = await supabase.from("venue_volunteers").insert({ venue_id: venueId, email: mail });
      if (error) throw error;
      await supabase.from("staff_invites").insert({ email: mail, role: "volunteer" as never });
    },
    onSuccess: async (_d, venueId) => {
      setVolEmail((m) => ({ ...m, [venueId]: "" }));
      await qc.invalidateQueries({ queryKey: ["venue-volunteers"] });
      toast.success("Volunteer assigned to venue.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeVolunteer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venue_volunteers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["venue-volunteers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Panel title="Create a venue">
        <form
          className="grid gap-3 sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            createVenue.mutate();
          }}
        >
          <div className="sm:col-span-2">
            <Label htmlFor="venue-name">Venue name</Label>
            <Input id="venue-name" required className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="venue-room">Room / block</Label>
            <Input id="venue-room" className="mt-1.5" value={room} onChange={(e) => setRoom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="venue-cap">Capacity</Label>
            <Input
              id="venue-cap"
              type="number"
              className="mt-1.5"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <Button type="submit" className="sm:col-span-4 sm:w-fit" disabled={createVenue.isPending}>
            Add venue
          </Button>
        </form>
      </Panel>

      {(venues ?? []).map((v) => {
        const vTeams = (teams ?? []).filter((t) => t.venue_id === v.id);
        const vVols = (assignments.data ?? []).filter((a) => a.venue_id === v.id);
        return (
          <Panel key={v.id} title={`${v.name}${v.room ? ` · ${v.room}` : ""}`} description={`${vTeams.length} teams assigned`}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Volunteers</h3>
                <div className="mt-3 space-y-2">
                  {vVols.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : null}
                  {vVols.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <span className="text-sm">{a.email}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeVolunteer.mutate(a.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addVolunteer.mutate(v.id);
                  }}
                >
                  <Input
                    type="email"
                    placeholder="volunteer@gmail.com"
                    value={volEmail[v.id] ?? ""}
                    onChange={(e) => setVolEmail((m) => ({ ...m, [v.id]: e.target.value }))}
                  />
                  <Button type="submit" variant="outline">
                    Assign
                  </Button>
                </form>
              </div>

              <div>
                <h3 className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Teams at this venue</h3>
                <div className="mt-3 space-y-2">
                  {vTeams.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : null}
                  {vTeams.map((t) => (
                    <div key={t.id} className="rounded-lg border border-border px-3 py-2">
                      <p className="text-sm font-medium">{t.team_name}</p>
                      <p className="font-mono text-xs text-cyan">{t.registration_id}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-5" onClick={() => deleteVenue.mutate(v.id)}>
              Delete venue
            </Button>
          </Panel>
        );
      })}
    </div>
  );
}

/* ---------------- tasks tab ---------------- */

type TaskRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  instructions: string | null;
  start_at: string | null;
  deadline: string | null;
  status: string;
  submission_type: string;
  assign_all: boolean;
};

function TasksTab() {
  const qc = useQueryClient();
  const { data: teams } = useTeams();
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    instructions: "",
    start_at: "",
    deadline: "",
    submission_type: "file",
    status: "active",
    assign_all: true,
  });

  const tasks = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TaskRow[];
    },
  });

  const assignmentsQ = useQuery({
    queryKey: ["admin-task-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("task_assignments").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const submissionsQ = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert({
        code: form.code.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        instructions: form.instructions.trim() || null,
        start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        submission_type: form.submission_type,
        status: form.status as never,
        assign_all: form.assign_all,
      });
      if (error) throw error;
      await logAudit("task.create", "tasks", undefined, { code: form.code });
    },
    onSuccess: async () => {
      setForm((f) => ({ ...f, code: "", title: "", description: "", instructions: "" }));
      await qc.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("Task created.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: status as never })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("Task updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAssign = useMutation({
    mutationFn: async ({ taskId, teamId, on }: { taskId: string; teamId: string; on: boolean }) => {
      if (on) {
        const { error } = await supabase.from("task_assignments").insert({ task_id: taskId, team_id: teamId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("task_assignments")
          .delete()
          .eq("task_id", taskId)
          .eq("team_id", teamId);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-task-assignments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const evaluate = useMutation({
    mutationFn: async ({ id, score, feedback }: { id: string; score: string; feedback: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("submissions")
        .update({
          score: score ? Number(score) : null,
          feedback: feedback || null,
          status: "evaluated",
          evaluated_at: new Date().toISOString(),
          evaluated_by: user.user?.id ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success("Evaluation saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const teamName = (id: string) => (teams ?? []).find((t) => t.id === id)?.team_name ?? id.slice(0, 8);

  return (
    <div className="space-y-6">
      <Panel title="Create a task round">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            createTask.mutate();
          }}
        >
          <div>
            <Label htmlFor="t-code">Round code</Label>
            <Input
              id="t-code"
              required
              placeholder="R1"
              className="mt-1.5"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="t-title">Title</Label>
            <Input
              id="t-title"
              required
              className="mt-1.5"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="t-desc">Problem statement</Label>
            <Textarea
              id="t-desc"
              rows={4}
              className="mt-1.5"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="t-inst">Instructions</Label>
            <Textarea
              id="t-inst"
              rows={3}
              className="mt-1.5"
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="t-start">Starts</Label>
            <Input
              id="t-start"
              type="datetime-local"
              className="mt-1.5"
              value={form.start_at}
              onChange={(e) => setForm((f) => ({ ...f, start_at: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="t-deadline">Deadline</Label>
            <Input
              id="t-deadline"
              type="datetime-local"
              className="mt-1.5"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            />
          </div>
          <div>
            <Label>Submission type</Label>
            <Select
              value={form.submission_type}
              onValueChange={(v) => setForm((f) => ({ ...f, submission_type: v }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">File upload</SelectItem>
                <SelectItem value="link">Link / GitHub URL</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["draft", "scheduled", "active", "closed", "archived"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4 sm:col-span-2">
            <Label htmlFor="t-all">Release to all verified teams</Label>
            <Switch
              id="t-all"
              checked={form.assign_all}
              onCheckedChange={(v) => setForm((f) => ({ ...f, assign_all: v }))}
            />
          </div>
          <Button type="submit" className="sm:w-fit" disabled={createTask.isPending}>
            Create task
          </Button>
        </form>
      </Panel>

      {(tasks.data ?? []).map((t) => {
        const subs = (submissionsQ.data ?? []).filter((s) => s.task_id === t.id);
        return (
          <Panel key={t.id} title={`${t.code} · ${t.title}`} description={`Deadline ${formatDate(t.deadline)}`}>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={t.status} onValueChange={(v) => setTaskStatus.mutate({ id: t.id, status: v })}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["draft", "scheduled", "active", "closed", "archived"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {t.assign_all ? "Released to all verified teams" : "Assigned to selected teams"}
              </span>
            </div>

            {!t.assign_all ? (
              <div className="mt-5">
                <h3 className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Assign teams</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(teams ?? []).map((team) => {
                    const on = (assignmentsQ.data ?? []).some(
                      (a) => a.task_id === t.id && a.team_id === team.id,
                    );
                    return (
                      <div
                        key={team.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      >
                        <span className="text-sm">{team.team_name}</span>
                        <Switch
                          checked={on}
                          onCheckedChange={(v) => toggleAssign.mutate({ taskId: t.id, teamId: team.id, on: v })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <h3 className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                Submissions ({subs.length})
              </h3>
              <div className="mt-3 space-y-3">
                {subs.length === 0 ? <p className="text-sm text-muted-foreground">No submissions yet.</p> : null}
                {subs.map((s) => (
                  <SubmissionRow
                    key={s.id}
                    submission={s as never}
                    teamName={teamName(s.team_id)}
                    onEvaluate={(score, feedback) => evaluate.mutate({ id: s.id, score, feedback })}
                  />
                ))}
              </div>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function SubmissionRow({
  submission,
  teamName,
  onEvaluate,
}: {
  submission: {
    id: string;
    content_text: string | null;
    link_url: string | null;
    file_path: string | null;
    status: string;
    score: number | null;
    feedback: string | null;
    created_at: string;
    version: number;
  };
  teamName: string;
  onEvaluate: (score: string, feedback: string) => void;
}) {
  const [score, setScore] = useState(submission.score != null ? String(submission.score) : "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");

  async function openFile() {
    if (!submission.file_path) return;
    const { data, error } = await supabase.storage
      .from("team-submissions")
      .createSignedUrl(submission.file_path, 300);
    if (error || !data) {
      toast.error("Could not open the file.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {teamName} · v{submission.version}
        </p>
        <span className="text-xs text-muted-foreground">{formatDate(submission.created_at)}</span>
      </div>
      {submission.content_text ? (
        <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">{submission.content_text}</p>
      ) : null}
      {submission.link_url ? (
        <a
          href={submission.link_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-primary hover:underline"
        >
          {submission.link_url}
        </a>
      ) : null}
      {submission.file_path ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={() => void openFile()}>
          Open uploaded file
        </Button>
      ) : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-[100px_1fr_auto]">
        <Input placeholder="Score" type="number" value={score} onChange={(e) => setScore(e.target.value)} />
        <Input placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <Button variant="outline" onClick={() => onEvaluate(score, feedback)}>
          Save evaluation
        </Button>
      </div>
    </div>
  );
}

/* ---------------- scan tab ---------------- */

export function ScanTab() {
  const [result, setResult] = useState<{ ok: boolean; message: string; team?: string | undefined } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleScan(code: string) {
    setBusy(true);
    const { data, error } = await supabase.rpc("scan_venue_pass", { _code: code });
    setBusy(false);
    if (error) {
      setResult({ ok: false, message: error.message });
      toast.error("Scan failed.");
      return;
    }
    const payload = (data ?? {}) as { ok?: boolean; message?: string; team_name?: string; error?: string };
    const ok = Boolean(payload.ok);
    setResult({
      ok,
      message: payload.message ?? payload.error ?? (ok ? "Check-in recorded." : "Pass not recognised."),
      team: payload.team_name,
    });
    if (ok) toast.success(`Checked in: ${payload.team_name ?? "team"}`);
    else toast.error(payload.message ?? payload.error ?? "Pass not recognised.");
  }

  return (
    <Panel title="Scan venue passes" description="Scan a team's QR pass or type the code to check them in.">
      <QrScanner onScan={(c) => void handleScan(c)} busy={busy} />
      {result ? (
        <div
          className={`mt-5 rounded-lg border p-4 text-sm ${
            result.ok ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          <p className="font-medium">{result.team ?? (result.ok ? "Checked in" : "Rejected")}</p>
          <p className="mt-1">{result.message}</p>
        </div>
      ) : null}
    </Panel>
  );
}
