import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { SiteFooter } from "@/components/siih/SiteFooter";
import { Button } from "@/components/ui/button";
import { settingsQuery, statsQuery } from "@/lib/siih";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Hackathon Tasks | SIIH 2.0" },
      {
        name: "description",
        content: "How SIIH 2.0 hackathon tasks, problem statement PDFs, deadlines and submissions work.",
      },
      { property: "og:title", content: "Hackathon Tasks | SIIH 2.0" },
      { property: "og:description", content: "Task rounds, documents and submission rules for SIIH 2.0 teams." },
    ],
  }),
  component: PublicTasks,
});

function PublicTasks() {
  const { data: stats } = useQuery(statsQuery);
  const { data: settings } = useQuery(settingsQuery);

  return (
    <div className="relative min-h-screen">
      <CyberBackground subtle />
      <SiteNavbar />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">Task rounds</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Hackathon tasks</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tasks are released round by round to verified teams. {stats?.tasks_released ?? 0} task
          {stats?.tasks_released === 1 ? " has" : "s have"} been released so far. Each task carries its own problem
          statement PDF, instructions and deadline — all visible inside your team portal.
        </p>

        <div className="mt-8 space-y-4">
          {[
            {
              title: "Problem statement release",
              body: "Verified teams receive the task with an attached PDF problem statement and reference material.",
            },
            {
              title: "Work window",
              body: "Each task has a start time and a hard deadline. Countdown timers appear on every task card.",
            },
            {
              title: "Submission",
              body: `Submissions accept the format defined per task — text, link, GitHub URL or file upload. ${
                settings?.submissions_open ? "Submissions are currently open." : "Submissions are currently closed."
              }`,
            },
            {
              title: "Evaluation",
              body: "Organisers review each submission. Scores and feedback are published to teams when enabled.",
            },
          ].map((item) => (
            <div key={item.title} className="glass flex gap-4 rounded-xl p-5">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-cyan" aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass mt-10 rounded-xl p-6">
          <p className="font-display text-xl">Your tasks live in the team portal</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your registered team leader Gmail to open assigned tasks and documents.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/auth">Team login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Register a team</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
