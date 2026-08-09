import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Rocket,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { SiteFooter } from "@/components/siih/SiteFooter";
import { CountdownTimer } from "@/components/siih/CountdownTimer";
import { StatCard } from "@/components/siih/StatCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, settingsQuery, statsQuery } from "@/lib/siih";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIIH 2.0 | Smart India Hackathon Internal Hackathon 2026" },
      {
        name: "description",
        content:
          "SIIH 2.0 Smart India Hackathon Internal Hackathon 2026. Ideas today. Impact tomorrow. Register your 6-member team and compete for a ₹1.5 Lakh prize pool.",
      },
      { property: "og:title", content: "SIIH 2.0 | Smart India Hackathon Internal Hackathon 2026" },
      {
        property: "og:description",
        content: "Register your team, track your status and take on hackathon tasks in the SIIH 2.0 command center.",
      },
    ],
  }),
  component: Landing,
});

const FAQS = [
  {
    q: "Who can participate in SIIH 2.0?",
    a: "Any enrolled student can participate. Teams register with a team leader who becomes the primary point of contact for all communication.",
  },
  {
    q: "How is my team verified?",
    a: "After you submit registration and upload payment proof, the organising committee reviews it. Your dashboard shows the live status and any rejection reason.",
  },
  {
    q: "How do I access hackathon tasks?",
    a: "Sign in with the Gmail address you registered as team leader. Assigned tasks, problem statement PDFs and submission forms appear in your team portal.",
  },
  {
    q: "Can we change team members after registering?",
    a: "Member edits are allowed until your registration is verified, after which the organisers must approve any change.",
  },
];

function Landing() {
  const { data: settings, isLoading } = useQuery(settingsQuery);
  const { data: stats, refetch } = useQuery(statsQuery);

  useEffect(() => {
    const channel = supabase
      .channel("public-team-counter")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, () => {
        void refetch();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <div className="relative min-h-screen">
      <CyberBackground />
      <SiteNavbar />

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-cyan uppercase">
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan" />
                Internal Hackathon 2026
              </span>

              <h1 className="mt-6 font-display text-5xl leading-[1.05] font-black sm:text-7xl">
                <span className="text-gradient">SIIH 2.0</span>
              </h1>
              <p className="mt-4 font-display text-lg tracking-[0.2em] text-foreground/90 uppercase sm:text-xl">
                {settings?.event_subtitle ?? "Smart India Hackathon — Internal Hackathon 2026"}
              </p>
              <p className="mt-5 max-w-xl text-lg font-semibold tracking-[0.18em] text-cyan uppercase">
                {settings?.tagline ?? "Ideas today. Impact tomorrow."}
              </p>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                {settings?.description ?? "Think. Build. Solve."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="group" style={{ boxShadow: "var(--glow-md)" }}>
                  <Link to="/register">
                    Register your team
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth">Team login</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link to="/teams">View registered teams</Link>
                </Button>
              </div>

              <dl className="mt-10 grid gap-4 sm:grid-cols-3">
                <HeroFact
                  icon={CalendarDays}
                  label="Event dates"
                  value={
                    settings
                      ? `${new Date(settings.start_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${new Date(settings.end_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                      : "—"
                  }
                />
                <HeroFact
                  icon={Users}
                  label="Team size"
                  value={
                    settings
                      ? settings.team_min_size === settings.team_max_size
                        ? `${settings.team_max_size} persons / team`
                        : `${settings.team_min_size}–${settings.team_max_size} per team`
                      : "—"
                  }
                />
                <HeroFact icon={Trophy} label="Prize pool" value={settings?.prize_text ?? "—"} />
              </dl>
            </div>

            <div className="glass rounded-2xl p-6" style={{ boxShadow: "var(--glow-md)" }}>
              {isLoading || !settings ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-8">
                  <CountdownTimer target={settings.start_at} label="Hackathon starts in" />
                  <CountdownTimer target={settings.registration_deadline} label="Registration closes in" />
                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/40 px-4 py-3">
                    <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Registration</span>
                    <span
                      className={
                        settings.registration_open
                          ? "text-sm font-semibold text-success"
                          : "text-sm font-semibold text-destructive"
                      }
                    >
                      {settings.registration_open ? "OPEN" : "CLOSED"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/40 px-4 py-3">
                    <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Fee</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(settings.registration_fee)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* LIVE STATS */}
        <Section id="stats" title="Live statistics" kicker="Realtime from the command center">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard value={stats?.total_teams ?? 0} label="Registered teams" icon={Users} />
            <StatCard value={stats?.total_students ?? 0} label="Students" icon={Rocket} />
            <StatCard value={stats?.verified_teams ?? 0} label="Verified teams" icon={ShieldCheck} />
            <StatCard value={stats?.colleges ?? 0} label="Colleges" icon={Building2} />
            <StatCard value={stats?.tasks_released ?? 0} label="Tasks released" icon={FileText} />
          </div>
        </Section>

        {/* ABOUT */}
        <Section id="about" title="About SIIH 2.0" kicker="What is this hackathon">
          <div className="grid gap-6 md:grid-cols-3">
            <InfoCard
              icon={Rocket}
              title="Build for real problems"
              body="Teams tackle problem statements drawn from industry, campus and civic needs — the same spirit as Smart India Hackathon."
            />
            <InfoCard
              icon={Award}
              title="Win and represent"
              body={`Compete for ${settings?.prize_text ?? "a substantial cash prize"} and a shot at representing the institution at the national stage.`}
            />
            <InfoCard
              icon={ShieldCheck}
              title="Transparent process"
              body="Every registration, payment and submission is tracked with a live status timeline in your team dashboard."
            />
          </div>
        </Section>

        {/* HOW IT WORKS */}
        <Section id="how" title="How it works" kicker="Five steps to the arena">
          <ol className="grid gap-4 md:grid-cols-5">
            {[
              "Register your team",
              "Pay the fee & upload proof",
              "Get verified by organisers",
              "Receive tasks & PDFs",
              "Submit your solution",
            ].map((step, i) => (
              <li key={step} className="glass relative rounded-xl p-5">
                <span className="font-display text-3xl font-black text-primary/40">0{i + 1}</span>
                <p className="mt-2 text-sm font-semibold text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* TIMELINE */}
        <Section id="timeline" title="Important dates" kicker="Mark your calendar">
          <div className="glass divide-y divide-border/60 rounded-xl">
            <TimelineRow label="Registration deadline" value={formatDate(settings?.registration_deadline)} />
            <TimelineRow label="Hackathon begins" value={formatDate(settings?.start_at)} />
            <TimelineRow label="Hackathon ends" value={formatDate(settings?.end_at)} />
          </div>
        </Section>

        {/* RULES */}
        <Section id="rules" title="Team requirements & rules" kicker="Read before registering">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              `Teams must have ${settings?.team_min_size ?? 6}–${settings?.team_max_size ?? 6} members including the leader.`,
              "The team leader's Gmail address is used for login — it must be valid and unique.",
              "Each member's email and student ID must be unique across all teams.",
              "Payment proof must be a clear JPG, PNG or PDF.",
              "Submissions after a task deadline are automatically blocked.",
              "Plagiarised or previously submitted work leads to disqualification.",
            ].map((rule) => (
              <div key={rule} className="glass flex gap-3 rounded-xl p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{rule}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" title="Frequently asked questions" kicker="Still wondering?">
          <Accordion type="single" collapsible className="glass rounded-xl px-4">
            {FAQS.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* CONTACT + CTA */}
        <Section id="contact" title="Contact" kicker="Need help registering?">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-xl p-6">
              <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Coordinator</p>
              <p className="mt-2 font-display text-xl">{settings?.contact_name || "To be announced"}</p>
              <p className="mt-3 text-sm text-muted-foreground">{settings?.contact_phone || "—"}</p>
              <p className="text-sm text-muted-foreground">{settings?.contact_email || "—"}</p>
            </div>
            <div
              className="glass flex flex-col justify-center rounded-xl p-6"
              style={{ boxShadow: "var(--glow-cyan)" }}
            >
              <p className="font-display text-2xl">Ready to build?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Registration takes about five minutes. Have your team details and payment proof ready.
              </p>
              <Button asChild size="lg" className="mt-5 self-start">
                <Link to="/register">
                  Register now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({
  id,
  title,
  kicker,
  children,
}: {
  id: string;
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-7">
        <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">{kicker}</p>
        <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function HeroFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <Icon className="h-4 w-4 text-cyan" aria-hidden="true" />
      <dt className="mt-2 text-[10px] tracking-[0.22em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof Users; title: string; body: string }) {
  return (
    <div className="glass rounded-xl p-6 transition-transform hover:-translate-y-0.5">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
