import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogIn, Mail, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsQuery } from "@/lib/siih";
import { useSupabaseSession } from "@/hooks/useSiih";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Team Login | SIIH 2.0" },
      {
        name: "description",
        content: "Sign in to the SIIH 2.0 team portal with the Gmail address you registered as team leader.",
      },
      { property: "og:title", content: "Team Login | SIIH 2.0" },
      { property: "og:description", content: "Access your SIIH 2.0 team dashboard, tasks and submissions." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useSupabaseSession();
  const { data: settings } = useQuery(settingsQuery);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/team", replace: true });
  }, [session, navigate]);

  const loginDisabled = settings ? !settings.login_open : false;

  async function signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/team", replace: true });
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) {
      toast.error("Could not send the sign-in link. Check the address and try again.");
      return;
    }
    setSent(true);
    toast.success("Sign-in link sent. Check your inbox.");
  }

  return (
    <div className="relative min-h-screen">
      <CyberBackground />
      <SiteNavbar />

      <main className="mx-auto flex max-w-lg flex-col px-4 py-16 sm:px-6">
        <div className="glass rounded-2xl p-7" style={{ boxShadow: "var(--glow-md)" }}>
          <h1 className="font-display text-2xl font-bold">Team leader login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the Gmail address you registered with. Access is granted only to registered team leaders.
          </p>

          {loginDisabled ? (
            <div className="mt-6 flex gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4">
              <ShieldAlert className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-sm text-warning">Login is temporarily disabled by the organisers.</p>
            </div>
          ) : (
            <>
              <Button
                type="button"
                size="lg"
                className="mt-6 w-full"
                onClick={() => void signInWithGoogle()}
                style={{ boxShadow: "var(--glow-sm)" }}
              >
                <LogIn className="mr-2 h-4 w-4" /> Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {sent ? (
                <p className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success">
                  A sign-in link is on its way to {email}. Open it on this device.
                </p>
              ) : (
                <form onSubmit={(e) => void sendMagicLink(e)} className="space-y-3">
                  <div>
                    <Label htmlFor="email">Registered email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teamleader@gmail.com"
                      className="mt-1.5"
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full" disabled={sending}>
                    <Mail className="mr-2 h-4 w-4" />
                    {sending ? "Sending link…" : "Email me a sign-in link"}
                  </Button>
                </form>
              )}
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No team yet?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register your team
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
