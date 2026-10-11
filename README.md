# The Embrione: Meet The Team (Next.js + Supabase)

Pages: `/register` (form + live card preview + WebP upload), `/admin` (moderation), `/team` (public directory).
Stack: Next.js 14 (App Router), JavaScript, Tailwind CSS, Supabase (Postgres + Storage), Vercel.

## 1. Run locally
```bash
npm install
cp .env.local.example .env.local     # Windows: copy .env.local.example .env.local
# open .env.local and paste your Supabase URL + anon key (see step 2)
npm run dev
```
Open http://localhost:3000

## 2. Set up Supabase (one time, ~10 minutes)
1. Sign up at https://supabase.com and click **New project**. Pick a name, set a database password (save it), choose the nearest region (e.g. Mumbai) and wait ~2 minutes.
2. In the left sidebar open **SQL Editor -> New query**. Paste the whole contents of `supabase/schema.sql` and click **Run**. This creates the `members` table, access policies, the public `member-photos` bucket and 5 approved mock profiles.
3. Check it worked: **Table Editor -> members** should show 5 rows, and **Storage** should show a public `member-photos` bucket.
4. Open **Project Settings -> API**. Copy the **Project URL** and the **anon public** key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. Restart `npm run dev` (Next.js only reads `.env.local` at startup).

### Where Supabase is used in the code
| File | What it does |
|---|---|
| `lib/supabase.js` | Creates the Supabase client (uses the two env vars) |
| `app/register/page.js` | `storage.upload()` the WebP, `getPublicUrl()`, then `from('members').insert()` with `status: 'pending'` |
| `app/admin/page.js` | `select()` all rows, `update({status})` to approve/reject, `delete()` |
| `app/team/page.js` | `select().eq('status','approved')` so only approved profiles are public |

## 3. Test the whole flow
1. `/register`: fill the form, watch the card update, pick a photo (bio must be 150-200 chars). Submit.
2. In Supabase **Storage -> member-photos** confirm the file ends in `.webp`.
3. `/admin`: log in with `admin@embrione.pes.edu` / `EmbrioneAdmin@2026`, approve the profile.
4. `/team`: your profile now appears. Try the domain/position filters.

## 4. Deploy to Vercel
1. Create a **public** GitHub repo and push (commit in small steps: `setup`, `feat: register form`, `feat: webp`, ...):
   ```bash
   git init && git add . && git commit -m "setup: project init"
   git branch -M main
   git remote add origin https://github.com/<you>/embrione-task.git
   git push -u origin main
   ```
2. On https://vercel.com click **Add New -> Project**, import the repo.
3. Before deploying, add **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optionally `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
4. Deploy, then **Settings -> Domains** and set `<yourfirstname>-embrione-task.vercel.app`.

## Troubleshooting
- **"new row violates row-level security policy" on upload**: the storage policies from `schema.sql` step 3 were not run.
- **Blank team page / fetch errors**: env vars missing or not restarted; check `.env.local`.
- **Env vars not working on Vercel**: add them in Project Settings, then redeploy.

## Security note
The RLS policies are intentionally open as the challenge brief specifies, so anyone with the anon key could edit rows. The admin login is checked server-side, but the admin page's database calls still use the public key. For production you would use Supabase Auth and restrict update/delete policies to the admin.
