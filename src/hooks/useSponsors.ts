import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Sponsor {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  audio_url: string | null;
  website_url: string | null;
  position: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
}

export function useActiveSponsors(position?: string) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date().toISOString();
    let query = supabase
      .from("sponsors")
      .select("*")
      .eq("is_active", true)
      .lte("starts_at", now);

    if (position) {
      query = query.eq("position", position);
    }

    query.then(({ data }) => {
      if (data) {
        // Filter expired sponsors client-side
        const active = data.filter(
          (s: any) => !s.expires_at || new Date(s.expires_at) > new Date()
        );
        setSponsors(active as Sponsor[]);
      }
      setLoading(false);
    });
  }, [position]);

  return { sponsors, loading };
}
