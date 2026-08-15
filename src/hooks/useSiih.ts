import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

/** Links the signed-in account to its registered team and returns role info. */
export function useSiihIdentity(enabled = true) {
  return useQuery({
    queryKey: ["identity"],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("bootstrap_session");
      if (error) throw error;
      const row = (
        data as unknown as Array<{
          team_id: string | null;
          is_admin: boolean;
          is_volunteer: boolean;
          role: string;
        }>
      )?.[0];
      return {
        teamId: row?.team_id ?? null,
        isAdmin: Boolean(row?.is_admin),
        isVolunteer: Boolean(row?.is_volunteer),
        role: row?.role ?? "guest",
      };
    },
  });
}


export function useMyTeam(teamId: string | null | undefined) {
  return useQuery({
    queryKey: ["my-team", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").eq("id", teamId!).single();
      if (error) throw error;
      return data;
    },
  });
}
