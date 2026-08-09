import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { CyberBackground } from "@/components/siih/CyberBackground";
import { SiteNavbar } from "@/components/siih/SiteNavbar";
import { SiteFooter } from "@/components/siih/SiteFooter";
import { StatusBadge } from "@/components/siih/StatusBadge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { directoryQuery } from "@/lib/siih";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Registered Teams | SIIH 2.0" },
      {
        name: "description",
        content: "Browse all teams registered for SIIH 2.0 Smart India Hackathon Internal Hackathon 2026.",
      },
      { property: "og:title", content: "Registered Teams | SIIH 2.0" },
      { property: "og:description", content: "Public directory of teams competing in SIIH 2.0." },
    ],
  }),
  component: TeamsDirectory,
});

const PAGE_SIZE = 12;

function TeamsDirectory() {
  const { data, isLoading } = useQuery(directoryQuery);
  const [search, setSearch] = useState("");
  const [college, setCollege] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const colleges = useMemo(
    () => Array.from(new Set((data ?? []).map((t) => t.college))).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((t) => {
      const matchesQ = !q || t.team_name.toLowerCase().includes(q) || t.college.toLowerCase().includes(q);
      const matchesCollege = college === "all" || t.college === college;
      const matchesStatus = status === "all" || t.status === status;
      return matchesQ && matchesCollege && matchesStatus;
    });
  }, [data, search, college, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="relative min-h-screen">
      <CyberBackground subtle />
      <SiteNavbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">Public directory</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Registered teams</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Only non-personal information is listed here. Emails, phone numbers, student IDs and payment details are
          never shown publicly.
        </p>

        <div className="glass mt-8 grid gap-3 rounded-xl p-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by team name or college"
              className="pl-9"
              aria-label="Search teams"
            />
          </div>
          <Select
            value={college}
            onValueChange={(v) => {
              setCollege(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="md:w-56" aria-label="Filter by college">
              <SelectValue placeholder="College" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All colleges</SelectItem>
              {colleges.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="md:w-44" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under review</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="glass mt-8 rounded-xl p-12 text-center">
            <p className="font-display text-lg">No teams found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search, or{" "}
              <Link to="/register" className="text-primary hover:underline">
                be the first to register
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((t) => (
                <article key={`${t.team_name}-${t.created_at}`} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg leading-tight">{t.team_name}</h2>
                    <StatusBadge status={t.status} />
                  </div>
                  {t.registration_id ? (
                    <p className="mt-1 font-mono text-xs text-cyan">{t.registration_id}</p>
                  ) : null}
                  <p className="mt-3 text-sm text-muted-foreground">{t.college}</p>
                  <p className="text-sm text-muted-foreground">{t.department}</p>
                  <p className="mt-3 text-xs tracking-widest text-muted-foreground uppercase">
                    {t.member_count} members
                    {t.city ? ` · ${t.city}` : ""}
                  </p>
                </article>
              ))}
            </div>

            {pages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {current} of {pages}
                </span>
                <Button variant="outline" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
                  Next
                </Button>
              </div>
            ) : null}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
