// One card component used in THREE places: the live preview (/register),
// the moderation list (/admin) and the public directory (/team).
// Reusing it is what makes the "live preview" match the final result exactly.
export default function MemberCard({ name, domain, position, branch, semester, bio, photo, children }) {
  return (
    <div className="flex flex-col rounded-2xl border border-edge bg-panel p-5 transition hover:-translate-y-1 hover:border-accent">
      {/* Default avatar placeholder when no photo has been chosen yet */}
      {photo ? (
        <img src={photo} alt={name || "Profile"} className="mx-auto h-28 w-28 rounded-full object-cover" />
      ) : (
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-edge text-4xl text-gray-500">?</div>
      )}
      {/* truncate / line-clamp stop long text from breaking the layout */}
      <h3 className="mt-4 truncate text-center text-lg font-semibold">{name || "Your name"}</h3>
      <p className="truncate text-center text-sm text-accent">{position || "Position"} · {domain || "Domain"}</p>
      <p className="mt-1 truncate text-center text-xs text-gray-400">
        {branch || "Branch"}{semester ? ` · Sem ${semester}` : ""}
      </p>
      <p className="mt-3 line-clamp-4 text-center text-sm text-gray-300">{bio || "Your short bio will appear here."}</p>
      {children}
    </div>
  );
}
