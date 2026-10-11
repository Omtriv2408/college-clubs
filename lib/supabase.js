import { createClient } from "@supabase/supabase-js";

// One shared Supabase client for the whole app.
// NEXT_PUBLIC_ variables are readable in the browser (the anon key is meant to be public;
// what it can do is controlled by the Row Level Security policies in supabase/schema.sql).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
