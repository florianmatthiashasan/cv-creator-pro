import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
  }

  browserClient ??= createBrowserClient(supabaseUrl, supabaseKey);

  return browserClient;
};
