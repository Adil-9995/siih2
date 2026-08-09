import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { SiteFooter } from "@/components/siih/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, settingsQuery, validateUpload, type CustomField } from "@/lib/siih";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register Your Team | SIIH 2.0" },
      {
        name: "description",
        content:
          "Register your team for SIIH 2.0 Smart India Hackathon Internal Hackathon 2026 — team details, members, payment proof and instant Team ID.",
      },
      { property: "og:title", content: "Register Your Team | SIIH 2.0" },
      { property: "og:description", content: "Five-step team registration for SIIH 2.0." },
    ],
  }),
  component: RegisterPage,
});

type Member = {
  full_name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  student_id: string;
  is_leader: boolean;
};

const emptyMember = (): Member => ({
  full_name: "",
  email: "",
  phone: "",
  college: "",
  department: "",
  year: "",
  student_id: "",
  is_leader: false,
});

const STEPS = ["Team", "Members", "Details", "Payment", "Review"];

function RegisterPage() {
  const { data: settings, isLoading } = useQuery(settingsQuery);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ registration_id: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [team, setTeam] = useState({
    team_name: "",
    leader_name: "",
    leader_email: "",
    leader_phone: "",
    college: "",
    department: "",
    year: "",
    state: "",
    city: "",
  });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<Member[]>([]);

  const size = settings?.team_max_size ?? 6;
  const minSize = settings?.team_min_size ?? 6;
  const fields: CustomField[] = useMemo(
    () => (Array.isArray(settings?.custom_fields) ? settings!.custom_fields : []),
    [settings],
  );

  // seed member rows once settings are known
  if (settings && members.length === 0) {
    const seeded = Array.from({ length: size }, (_, i) => ({ ...emptyMember(), is_leader: i === 0 }));
    setMembers(seeded);
  }

  function updateMember(i: number, patch: Partial<Member>) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function validateStep(): string | null {
    if (step === 0) {
      for (const [k, v] of Object.entries(team)) {
        if (["year", "state", "city"].includes(k)) continue;
        if (!v.trim()) return "Please complete all team information fields.";
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(team.leader_email)) return "Enter a valid team leader email.";
    }
    if (step === 1) {
      const filled = members.filter((m) => m.full_name.trim() && m.email.trim());
      if (filled.length < minSize) return `At least ${minSize} members are required.`;
      const emails = filled.map((m) => m.email.trim().toLowerCase());
      if (new Set(emails).size !== emails.length) return "Duplicate member emails found.";
    }
    if (step === 2) {
      for (const f of fields) {
        if (f.required && !responses[f.key]?.trim()) return `${f.label} is required.`;
      }
    }
    if (step === 3 && settings) {
      if (!file) return "Upload your payment proof to continue.";
      const err = validateUpload(file, settings.max_upload_mb);
      if (err) return err;
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    if (!settings || !file) return;
    if (!confirmed) {
      toast.error("Please confirm that the information provided is correct.");
      return;
    }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw new Error("Payment proof upload failed. Please try again.");

      const payload = {
        ...team,
        leader_email: team.leader_email.trim().toLowerCase(),
        form_responses: responses,
        proof_path: path,
        proof_mime: file.type,
        members: members
          .filter((m) => m.full_name.trim() && m.email.trim())
          .map((m) => ({ ...m, email: m.email.trim().toLowerCase() })),
      };

      const { data, error } = await supabase.rpc("submit_registration", { p: payload as never });
      if (error) throw new Error(error.message);
      const row = (data as unknown as Array<{ registration_id: string }>)?.[0];
      setResult({ registration_id: row?.registration_id ?? "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="relative min-h-screen">
        <CyberBackground subtle />
        <SiteNavbar />
        <main className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (result) {
    return (
      <div className="relative min-h-screen">
        <CyberBackground />
        <SiteNavbar />
        <main className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
          <div className="glass rounded-2xl p-10 text-center" style={{ boxShadow: "var(--glow-md)" }}>
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h1 className="mt-5 font-display text-3xl font-bold">Registration successful</h1>
            <p className="mt-3 text-sm text-muted-foreground">Save your Team Registration ID.</p>
            <p className="mt-6 font-mono text-3xl font-bold text-cyan">{result.registration_id}</p>
            <p className="mt-6 text-sm text-muted-foreground">
              Your payment proof is under review. Sign in with{" "}
              <span className="text-foreground">{team.leader_email}</span> to track your status.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/auth">Go to team login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/teams">View registered teams</Link>
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!settings.registration_open) {
    return (
      <div className="relative min-h-screen">
        <CyberBackground subtle />
        <SiteNavbar />
        <main className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
          <div className="glass rounded-2xl p-10 text-center">
            <h1 className="font-display text-2xl font-bold">Registration is closed</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              The organisers have closed registration for now. Check back later or contact the coordinator.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <CyberBackground subtle />
      <SiteNavbar />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">Team registration</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Join SIIH 2.0</h1>

        <ol className="mt-8 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase ${
                i === step
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : i < step
                    ? "border-success/50 bg-success/10 text-success"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>

        <div className="glass mt-6 rounded-2xl p-6">
          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Team name" value={team.team_name} onChange={(v) => setTeam({ ...team, team_name: v })} />
              <Field
                label="Team leader full name"
                value={team.leader_name}
                onChange={(v) => setTeam({ ...team, leader_name: v })}
              />
              <Field
                label="Team leader Gmail"
                type="email"
                value={team.leader_email}
                onChange={(v) => setTeam({ ...team, leader_email: v })}
              />
              <Field
                label="Team leader phone"
                value={team.leader_phone}
                onChange={(v) => setTeam({ ...team, leader_phone: v })}
              />
              <Field label="College / Institution" value={team.college} onChange={(v) => setTeam({ ...team, college: v })} />
              <Field label="Department" value={team.department} onChange={(v) => setTeam({ ...team, department: v })} />
              <Field label="Year / Semester" value={team.year} onChange={(v) => setTeam({ ...team, year: v })} />
              <Field label="State" value={team.state} onChange={(v) => setTeam({ ...team, state: v })} />
              <Field label="City" value={team.city} onChange={(v) => setTeam({ ...team, city: v })} />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {minSize === size ? `${size} members required` : `${minSize}–${size} members`} — member 1 is the team
                leader.
              </p>
              {members.map((m, i) => (
                <div key={i} className="rounded-xl border border-border/70 p-4">
                  <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
                    Member {i + 1} {m.is_leader ? "· Team leader" : ""}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name" value={m.full_name} onChange={(v) => updateMember(i, { full_name: v })} />
                    <Field label="Gmail" type="email" value={m.email} onChange={(v) => updateMember(i, { email: v })} />
                    <Field label="Phone" value={m.phone} onChange={(v) => updateMember(i, { phone: v })} />
                    <Field label="College" value={m.college} onChange={(v) => updateMember(i, { college: v })} />
                    <Field label="Department" value={m.department} onChange={(v) => updateMember(i, { department: v })} />
                    <Field label="Year" value={m.year} onChange={(v) => updateMember(i, { year: v })} />
                    <Field
                      label="Student ID / Roll no."
                      value={m.student_id}
                      onChange={(v) => updateMember(i, { student_id: v })}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  No additional questions have been configured. Continue to payment.
                </p>
              ) : (
                fields.map((f) =>
                  f.type === "textarea" ? (
                    <div key={f.key} className="sm:col-span-2">
                      <Label htmlFor={f.key}>
                        {f.label} {f.required ? <span className="text-destructive">*</span> : null}
                      </Label>
                      <Textarea
                        id={f.key}
                        className="mt-1.5"
                        value={responses[f.key] ?? ""}
                        onChange={(e) => setResponses({ ...responses, [f.key]: e.target.value })}
                      />
                    </div>
                  ) : (
                    <Field
                      key={f.key}
                      label={f.label + (f.required ? " *" : "")}
                      value={responses[f.key] ?? ""}
                      onChange={(v) => setResponses({ ...responses, [f.key]: v })}
                    />
                  ),
                )
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-border/70 bg-secondary/30 p-5">
                <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Registration fee</p>
                <p className="mt-1 font-display text-3xl font-bold text-cyan">
                  {formatCurrency(settings.registration_fee)}
                </p>
                {settings.upi_id ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    UPI ID: <span className="font-mono text-foreground">{settings.upi_id}</span>
                  </p>
                ) : null}
                {settings.payment_qr_url ? (
                  <img
                    src={settings.payment_qr_url}
                    alt="Payment QR code"
                    className="mt-4 h-44 w-44 rounded-lg border border-border bg-white p-2"
                    loading="lazy"
                  />
                ) : null}
                <p className="mt-4 text-sm text-muted-foreground">
                  Pay the fee, then upload a clear screenshot or receipt (JPG, PNG or PDF, max{" "}
                  {settings.max_upload_mb} MB).
                </p>
              </div>

              <div>
                <Label htmlFor="proof">Payment proof</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Input
                    id="proof"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </div>
                {file ? <p className="mt-2 text-xs text-success">Selected: {file.name}</p> : null}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <Summary label="Team name" value={team.team_name} />
              <Summary label="Team leader" value={`${team.leader_name} · ${team.leader_email}`} />
              <Summary label="College" value={`${team.college} · ${team.department}`} />
              <Summary label="Location" value={[team.city, team.state].filter(Boolean).join(", ") || "—"} />
              <Summary
                label="Members"
                value={members
                  .filter((m) => m.full_name)
                  .map((m) => m.full_name)
                  .join(", ")}
              />
              <Summary label="Fee" value={formatCurrency(settings.registration_fee)} />
              <Summary label="Payment proof" value={file?.name ?? "—"} />

              <label className="flex items-start gap-3 rounded-lg border border-border/70 p-4">
                <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} />
                <span className="text-sm text-muted-foreground">
                  I confirm that the information provided is correct.
                </span>
              </label>
            </div>
          ) : null}

          <div className="mt-8 flex justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <Button onClick={() => void submit()} disabled={submitting} style={{ boxShadow: "var(--glow-sm)" }}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit registration
              </Button>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border/60 pb-3">
      <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{label}</span>
      <span className="text-sm text-foreground">{value || "—"}</span>
    </div>
  );
}
