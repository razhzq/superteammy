import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type {
  Event,
  Member,
  Partner,
  Project,
  Announcement,
  LandingContent,
  ContentStatus,
} from "../lib/database.types";
import type { RealtimeChannel } from "@supabase/supabase-js";

/* ── Generic list hook with optional real-time ── */

function useTable<T>(
  table: string,
  orderBy = "created_at",
  filter?: { column: string; value: string },
  realtime = false
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select("*").order(orderBy, { ascending: false });
    if (filter) query = query.eq(filter.column, filter.value);
    const { data: rows } = await query;
    setData((rows as T[]) ?? []);
    setLoading(false);
  }, [table, orderBy, filter?.column, filter?.value]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Real-time subscription
  useEffect(() => {
    if (!realtime) return;

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          fetch();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [table, realtime, fetch]);

  return { data, loading, refetch: fetch };
}

/* ── Events ── */

export function useEvents(status?: ContentStatus, realtime = false) {
  return useTable<Event>(
    "events",
    "event_date",
    status ? { column: "status", value: status } : undefined,
    realtime
  );
}

export async function createEvent(event: Omit<Event, "id" | "created_at" | "updated_at">) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("events").insert(event).select().single();
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("events").update(updates).eq("id", id).select().single();
}

export async function deleteEvent(id: string) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("events").delete().eq("id", id);
}

/* ── Members ── */

export function useMembers(featuredOnly?: boolean, realtime = false) {
  return useTable<Member>(
    "members",
    "name",
    featuredOnly ? { column: "is_featured", value: "true" } : undefined,
    realtime
  );
}

export async function createMember(member: Omit<Member, "id" | "created_at">) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("members").insert(member).select().single();
}

export async function updateMember(id: string, updates: Partial<Member>) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("members").update(updates).eq("id", id).select().single();
}

export async function deleteMember(id: string) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("members").delete().eq("id", id);
}

/* ── Partners ── */

export function usePartners(realtime = false) {
  return useTable<Partner>("partners", "name", undefined, realtime);
}

export async function createPartner(partner: Omit<Partner, "id" | "created_at">) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("partners").insert(partner).select().single();
}

export async function updatePartner(id: string, updates: Partial<Partner>) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("partners").update(updates).eq("id", id).select().single();
}

export async function deletePartner(id: string) {
  if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase not configured") };
  return supabase.from("partners").delete().eq("id", id);
}

/* ── Projects ── */

export function useProjects(realtime = false) {
  return useTable<Project>("projects", "name", undefined, realtime);
}

export async function createProject(project: Omit<Project, "id" | "created_at">) {
  return supabase.from("projects").insert(project).select().single();
}

export async function updateProject(id: string, updates: Partial<Project>) {
  return supabase.from("projects").update(updates).eq("id", id).select().single();
}

export async function deleteProject(id: string) {
  return supabase.from("projects").delete().eq("id", id);
}

/* ── Announcements ── */

export function useAnnouncements(status?: ContentStatus, realtime = false) {
  return useTable<Announcement>(
    "announcements",
    "created_at",
    status ? { column: "status", value: status } : undefined,
    realtime
  );
}

export async function createAnnouncement(
  announcement: Omit<Announcement, "id" | "created_at" | "updated_at">
) {
  return supabase.from("announcements").insert(announcement).select().single();
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>) {
  return supabase.from("announcements").update(updates).eq("id", id).select().single();
}

export async function deleteAnnouncement(id: string) {
  return supabase.from("announcements").delete().eq("id", id);
}

/* ── Landing Content ── */

export function useLandingContent(section: string) {
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("landing_content")
        .select("*")
        .eq("section", section)
        .single();
      if (data) {
        setContent((data as LandingContent).content_json as Record<string, string>);
      }
      setLoading(false);
    }
    load();

    // Real-time subscription for landing content
    const channel = supabase
      .channel(`landing-${section}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "landing_content",
          filter: `section=eq.${section}`,
        },
        (payload) => {
          if (payload.new && "content_json" in payload.new) {
            setContent(payload.new.content_json as Record<string, string>);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [section]);

  return { content, loading };
}

/* ── Media Upload ── */

export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) return { url: null, error };
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: publicUrl, error: null };
}

export async function deleteFile(bucket: string, path: string) {
  return supabase.storage.from(bucket).remove([path]);
}
