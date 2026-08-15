import { supabase } from "@/integrations/supabase/client";

export type Settings = {
  id: string;
  event_name: string;
  event_subtitle: string;
  tagline: string;
  description: string;
  announcement: string | null;
  start_at: string;
  end_at: string;
  registration_deadline: string;
  team_min_size: number;
  team_max_size: number;
  registration_fee: number;
  prize_text: string;
  upi_id: string | null;
  payment_qr_url: string | null;
  poster_url: string | null;
  logo_url: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  max_upload_mb: number;
  registration_open: boolean;
  login_open: boolean;
  submissions_open: boolean;
  public_show_leader: boolean;
  public_show_reg_id: boolean;
  rules_text: string;
  rounds_text: string;
  custom_fields: CustomField[];
};


export type CustomField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "email" | "phone" | "number" | "select" | "url" | "date";
  required: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
};

export const settingsQuery = {
  queryKey: ["settings"],
  queryFn: async (): Promise<Settings> => {
    const { data, error } = await supabase.from("hackathon_settings").select("*").limit(1).single();
    if (error) throw error;
    return data as unknown as Settings;
  },
  staleTime: 60_000,
};

export const statsQuery = {
  queryKey: ["public-stats"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("public_stats");
    if (error) throw error;
    const row = (data as unknown as Array<Record<string, number>>)?.[0];
    return {
      total_teams: Number(row?.["total_teams"] ?? 0),
      total_students: Number(row?.["total_students"] ?? 0),
      verified_teams: Number(row?.["verified_teams"] ?? 0),
      colleges: Number(row?.["colleges"] ?? 0),
      tasks_released: Number(row?.["tasks_released"] ?? 0),
    };
  },
  staleTime: 15_000,
};

export const directoryQuery = {
  queryKey: ["public-directory"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("public_team_directory");
    if (error) throw error;
    return (data ?? []) as unknown as Array<{
      registration_id: string | null;
      team_name: string;
      college: string;
      department: string;
      city: string | null;
      state: string | null;
      status: string;
      member_count: number;
      created_at: string;
    }>;
  },
  staleTime: 15_000,
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ACCEPTED_PROOF_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

export function validateUpload(file: File, maxMb: number): string | null {
  if (!ACCEPTED_PROOF_TYPES.includes(file.type)) {
    return "Unsupported file. Upload a JPG, PNG or PDF.";
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `File too large. Maximum size is ${maxMb} MB.`;
  }
  return null;
}

export async function logAudit(action: string, entity: string, entityId?: string, meta: Record<string, unknown> = {}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("audit_logs").insert({
    actor_id: data.user.id,
    actor_email: data.user.email ?? null,
    action,
    entity,
    entity_id: entityId ?? null,
    meta: meta as never,
  });
}
