import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { StatusBadge } from "@/components/siih/StatusBadge";
import { QrPass } from "@/components/siih/QrPass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, logAudit } from "@/lib/siih";
import { useSiihIdentity, useMyTeam, useSupabaseSession } from "@/hooks/useSiih";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Portal | SIIH 2.0" },
      { name: "description", content: "Your SIIH 2.0 team dashboard: venue pass, registration status, tasks and submissions." },
      { property: "og:title", content: "Team Portal | SIIH 2.0" },
      { property: "og:description", content: "Track your SIIH 2.0 registration, venue pass, tasks and submissions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeamPortal,
});

function TeamPortal() {
  const { session, loading } = useSupabaseSession();
  const { data: identity, isLoading: identityLoading } = useSiihIdentity(!!session);
  const { data: team, isLoading: teamLoading } = useMyTeam(identity?.teamId);

  const venue = useQuery({
    queryKey: ["team-venue", team?.venue_id],
    enabled: Boolean(team?.venue_id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("name, room")
        .eq("id", team!.venue_id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const tasks = useQuery({
    queryKey: ["team-tasks", identity?.teamId],
    enabled: Boolean(identity?.teamId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("deadline", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const submissions = useQuery({
    queryKey: ["team-submissions", identity?.teamId],
    enabled: Boolean(identity?.teamId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("team_id", identity!.teamId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

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

  if (!identity?.teamId) {
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
            <h2 className="font-display text-xl">Venue pass</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Show this QR at the entry desk. Volunteers scan it to check your team in.
            </p>
            <div className="mt-6">
              {team.pass_code ? (
                <QrPass
                  code={team.pass_code}
                  label={team.team_name}
                  sublabel={
                    venue.data
                      ? `${venue.data.name}${venue.data.room ? ` · ${venue.data.room}` : ""}`
                      : "Venue will be announced by the organisers"
                  }
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your pass is generated once your registration is reviewed.
                </p>
              )}
            </div>
          </div>

          <div className="glass mt-6 rounded-2xl p-7">
            <h2 className="font-display text-xl">Tasks & submissions</h2>
            {tasks.isLoading ? (
              <Skeleton className="mt-4 h-24 w-full rounded-lg" />
            ) : (tasks.data?.length ?? 0) === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No tasks released yet. Tasks unlock once your payment is verified — you'll see them here.
              </p>
            ) : (
              <div className="mt-5 space-y-5">
                {tasks.data?.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    teamId={identity.teamId!}
                    submissions={(submissions.data ?? []).filter((s) => s.task_id === task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}

type TaskRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  instructions: string | null;
  deadline: string | null;
  submission_type: string;
  status: string;
  allow_resubmission: boolean;
};

type SubmissionRow = {
  id: string;
  task_id: string;
  version: number;
  status: string;
  score: number | null;
  feedback: string | null;
  link_url: string | null;
  file_path: string | null;
  created_at: string;
};

function TaskCard({
  task,
  teamId,
  submissions,
}: {
  task: TaskRow;
  teamId: string;
  submissions: SubmissionRow[];
}) {
  const qc = useQueryClient();
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const overdue = task.deadline ? new Date(task.deadline).getTime() < Date.now() : false;
  const latest = submissions[0];
  const locked = overdue || (Boolean(latest) && !task.allow_resubmission);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!link.trim() && !file && !notes.trim()) {
      toast.error("Add a link, a file or notes before submitting.");
      return;
    }
    setBusy(true);
    try {
      let filePath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${teamId}/${task.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("team-submissions").upload(path, file, {
          upsert: false,
          contentType: file.type,
        });
        if (upErr) throw upErr;
        filePath = path;
      }
      const { error } = await supabase.from("submissions").insert({
        task_id: task.id,
        team_id: teamId,
        version: (latest?.version ?? 0) + 1,
        link_url: link.trim() || null,
        notes: notes.trim() || null,
        file_path: filePath,
        status: "submitted",
      });
      if (error) throw error;
      await logAudit("submission.create", "submissions", task.id, { task: task.code });
      toast.success("Submission received.");
      setLink("");
      setNotes("");
      setFile(null);
      await qc.invalidateQueries({ queryKey: ["team-submissions"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-cyan">{task.code}</p>
          <h3 className="font-display text-lg font-semibold">{task.title}</h3>
        </div>
        <p className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
          Deadline: {formatDate(task.deadline)}
        </p>
      </div>
      {task.description ? <p className="mt-3 text-sm text-muted-foreground">{task.description}</p> : null}
      {task.instructions ? (
        <p className="mt-2 text-xs whitespace-pre-line text-muted-foreground">{task.instructions}</p>
      ) : null}

      {submissions.length > 0 ? (
        <div className="mt-4 space-y-2">
          {submissions.map((s) => (
            <div key={s.id} className="rounded-lg border border-border/70 p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  v{s.version} · {s.status}
                </span>
                <span className="text-muted-foreground">{formatDate(s.created_at)}</span>
              </div>
              {s.score !== null ? <p className="mt-1 text-success">Score: {s.score}</p> : null}
              {s.feedback ? <p className="mt-1 text-muted-foreground">{s.feedback}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {locked ? (
        <p className="mt-4 text-xs text-warning">
          {overdue ? "The deadline has passed — submissions are closed." : "Submitted. Resubmission is not allowed for this task."}
        </p>
      ) : (
        <form className="mt-4 space-y-3" onSubmit={(e) => void submit(e)}>
          <div>
            <Label htmlFor={`link-${task.id}`}>Link (GitHub, drive, demo)</Label>
            <Input
              id={`link-${task.id}`}
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://github.com/…"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={`file-${task.id}`}>File upload</Label>
            <Input
              id={`file-${task.id}`}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={`notes-${task.id}`}>Notes</Label>
            <Textarea
              id={`notes-${task.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={busy} style={{ boxShadow: "var(--glow-sm)" }}>
            {busy ? "Submitting…" : "Submit"}
          </Button>
        </form>
      )}
    </div>
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
