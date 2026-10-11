"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import MemberCard from "../../components/MemberCard";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [members, setMembers] = useState([]);

  // Keep the admin logged in across refreshes (cleared when the tab closes)
  useEffect(() => { if (sessionStorage.getItem("admin") === "1") setLoggedIn(true); }, []);

  async function login(e) {
    e.preventDefault();
    // The credentials are verified on the SERVER (app/api/admin-login/route.js)
    const res = await fetch("/api/admin-login", { method: "POST", body: JSON.stringify(creds) });
    if (res.ok) { sessionStorage.setItem("admin", "1"); setLoggedIn(true); toast.success("Welcome, admin"); }
    else toast.error("Wrong email or password");
  }

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setMembers(data);
  }, []);
  useEffect(() => { if (loggedIn) load(); }, [loggedIn, load]);

  // One function handles approve / reject: it just updates the `status` column.
  async function setStatus(id, status) {
    const { error } = await supabase.from("members").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`); load();
  }
  async function remove(id) {
    if (!confirm("Delete this profile permanently?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  if (!loggedIn) {
    return (
      <form onSubmit={login} className="mx-auto max-w-sm space-y-3">
        <h1 className="text-2xl font-bold">Admin login</h1>
        <input className="field" type="email" placeholder="Email" required onChange={(e) => setCreds({ ...creds, email: e.target.value })} />
        <input className="field" type="password" placeholder="Password" required onChange={(e) => setCreds({ ...creds, password: e.target.value })} />
        <button className="btn w-full">Log in</button>
      </form>
    );
  }

  const pending = members.filter((m) => m.status === "pending");
  const stats = [["Total submissions", members.length], ["Pending", pending.length], ["Approved", members.filter((m) => m.status === "approved").length]];

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-xl border border-edge bg-panel p-4">
            <p className="text-3xl font-bold">{n}</p><p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>
      <h2 className="mb-4 mt-8 text-xl font-semibold">Waiting for review</h2>
      {pending.length === 0 && <p className="text-gray-400">Nothing pending. New registrations will show up here.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pending.map((m) => (
          <MemberCard key={m.id} {...m} photo={m.photo_url}>
            <p className="mt-2 truncate text-center text-xs text-gray-500">{m.srn} · {m.email}</p>
            <div className="mt-4 flex gap-2">
              <button className="btn flex-1" onClick={() => setStatus(m.id, "approved")}>Approve</button>
              <button className="btn-ghost flex-1" onClick={() => setStatus(m.id, "rejected")}>Reject</button>
              <button className="btn-ghost" onClick={() => remove(m.id)} aria-label="Delete">🗑</button>
            </div>
          </MemberCard>
        ))}
      </div>
    </div>
  );
}
