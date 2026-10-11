"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { DOMAINS, POSITIONS } from "../../lib/constants";
import MemberCard from "../../components/MemberCard";

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [position, setPosition] = useState("");

  useEffect(() => {
    // The key line: only rows the admin approved are ever fetched for the public page.
    supabase.from("members").select("*").eq("status", "approved").order("created_at")
      .then(({ data }) => { setMembers(data || []); setLoading(false); });
  }, []);

  // Filtering happens in the browser on the already-fetched list (fast, no extra requests)
  const shown = members.filter((m) => (!domain || m.domain === domain) && (!position || m.position === position));

  return (
    <div>
      <h1 className="text-3xl font-bold">Meet the team</h1>
      <div className="my-6 flex flex-wrap gap-3">
        <select className="field w-auto" value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">All domains</option>{DOMAINS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="field w-auto" value={position} onChange={(e) => setPosition(e.target.value)}>
          <option value="">All positions</option>{POSITIONS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      {loading ? <p className="text-gray-400">Loading...</p> : shown.length === 0 ? (
        <p className="text-gray-400">No members match these filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((m) => (
            <MemberCard key={m.id} {...m} photo={m.photo_url}>
              <div className="mt-4 flex justify-center gap-4 text-sm">
                {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">LinkedIn</a>}
                {m.github_url && <a href={m.github_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">GitHub</a>}
              </div>
            </MemberCard>
          ))}
        </div>
      )}
    </div>
  );
}
