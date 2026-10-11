-- Run this whole file once in Supabase -> SQL Editor -> New query -> Run.

-- 1. The members table (from the brief)
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null,
  position text not null,
  srn text not null,
  email text not null,
  linkedin_url text,
  github_url text,
  branch text not null,
  semester integer not null,
  bio text,
  photo_url text not null,
  status text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Row Level Security: Supabase blocks everything until policies allow it.
-- These are deliberately open (as the brief says). NOT production-safe.
alter table public.members enable row level security;
create policy "Allow public insert" on public.members for insert with check (true);
create policy "Allow public read"   on public.members for select using (true);
create policy "Allow admin updates" on public.members for update using (true);
create policy "Allow admin deletes" on public.members for delete using (true);

-- 3. Public storage bucket for photos + permission to upload/read files in it
insert into storage.buckets (id, name, public) values ('member-photos', 'member-photos', true)
on conflict (id) do nothing;
create policy "Public read photos"   on storage.objects for select using (bucket_id = 'member-photos');
create policy "Public upload photos" on storage.objects for insert with check (bucket_id = 'member-photos');

-- 4. Mock profiles so /team looks alive immediately (already approved)
insert into public.members (name, domain, position, srn, email, linkedin_url, github_url, branch, semester, bio, photo_url, status) values
('Aarav Mehta','Web Development','Head','PES1UG22CS001','aarav@example.com','https://linkedin.com','https://github.com','CSE',7,'Builds fast, clean web apps and loves mentoring juniors. Leads the web team through every fest, from the first wireframe to the final deploy.','https://api.dicebear.com/7.x/avataaars/png?seed=Aarav','approved'),
('Diya Nair','Design','Vice-Head','PES1UG22AM014','diya@example.com','https://linkedin.com','https://github.com','AIML',7,'Designs posters, brand kits and UI flows. Believes good design is invisible, and spends her free time sketching and photographing city streets.','https://api.dicebear.com/7.x/avataaars/png?seed=Diya','approved'),
('Rohan Iyer','Logistics','Core Member','PES1UG23EC027','rohan@example.com','https://linkedin.com','https://github.com','ECE',5,'Keeps equipment, transport and vendors moving on schedule. If something needs to be at the venue by 8 AM, Rohan has already planned how.','https://api.dicebear.com/7.x/avataaars/png?seed=Rohan','approved'),
('Sneha Rao','Sponsorship','Core Member','PES1UG23ME033','sneha@example.com','https://linkedin.com','https://github.com','ME',5,'Reaches out to brands and local businesses for fest partnerships. Great at turning a cold email into a long-term sponsor and a warm friendship.','https://api.dicebear.com/7.x/avataaars/png?seed=Sneha','approved'),
('Kabir Shah','Social Media','Member','PES1UG24BT009','kabir@example.com','https://linkedin.com','https://github.com','Biotech',3,'Writes captions, edits reels and runs the Instagram calendar. Always watching what is trending so the team never misses a good moment.','https://api.dicebear.com/7.x/avataaars/png?seed=Kabir','approved');
