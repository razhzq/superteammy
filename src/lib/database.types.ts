export type UserRole = "admin" | "editor";
export type ContentStatus = "draft" | "published";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string | null;
  registration_link: string | null;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string | null;
  avatar_url: string | null;
  skills: string[];
  twitter_url: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  project_url: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandingContent {
  id: string;
  section: string;
  content_json: Record<string, unknown>;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: { [K in keyof Omit<Profile, "created_at">]: Profile[K] };
        Update: { [K in keyof Profile]?: Profile[K] };
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: { [K in keyof Omit<Event, "id" | "created_at" | "updated_at">]: Event[K] };
        Update: { [K in keyof Event]?: Event[K] };
        Relationships: [];
      };
      members: {
        Row: Member;
        Insert: { [K in keyof Omit<Member, "id" | "created_at">]: Member[K] };
        Update: { [K in keyof Member]?: Member[K] };
        Relationships: [];
      };
      partners: {
        Row: Partner;
        Insert: { [K in keyof Omit<Partner, "id" | "created_at">]: Partner[K] };
        Update: { [K in keyof Partner]?: Partner[K] };
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: { [K in keyof Omit<Project, "id" | "created_at">]: Project[K] };
        Update: { [K in keyof Project]?: Project[K] };
        Relationships: [];
      };
      announcements: {
        Row: Announcement;
        Insert: { [K in keyof Omit<Announcement, "id" | "created_at" | "updated_at">]: Announcement[K] };
        Update: { [K in keyof Announcement]?: Announcement[K] };
        Relationships: [];
      };
      landing_content: {
        Row: LandingContent;
        Insert: { section: string; content_json: Record<string, unknown> };
        Update: { section?: string; content_json?: Record<string, unknown> };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
}
