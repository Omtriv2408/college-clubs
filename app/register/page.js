"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { convertToWebP } from "../../lib/webp";
import { DOMAINS, POSITIONS, BRANCHES, SEMESTERS } from "../../lib/constants";
import MemberCard from "../../components/MemberCard";

const empty = { name: "", domain: "", position: "", srn: "", email: "", linkedin_url: "", github_url: "", branch: "", semester: "", bio: "" };

export default function Register() {
  // MAIN IDEA OF THE LIVE PREVIEW: all inputs write into ONE state object `form`.
  // The <MemberCard> reads from the same object, so it re-renders on every keystroke.
  const [form, setForm] = useState(empty);
  const [webp, setWebp] = useState(null);       // converted image blob (kept in memory, NOT uploaded yet)
  const [preview, setPreview] = useState("");   // local blob: URL for showing the photo
  const [busy, setBusy] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Free the temporary preview URL when it changes / the page closes
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  async function onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) return toast.error("Use a .png, .jpg or .jpeg image");
    try {
      const blob = await convertToWebP(file);       // convert on select, as the brief requires
      setWebp(blob);
      setPreview(URL.createObjectURL(blob));        // local preview only, nothing uploaded yet
      toast.success(`Converted to WebP (${Math.round(file.size / 1024)}KB -> ${Math.round(blob.size / 1024)}KB)`);
    } catch (err) { toast.error(err.message); }
  }

  async function submit(e) {
    e.preventDefault();
    if (!/^PES\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/i.test(form.srn)) return toast.error("SRN should look like PES1UG23CS001");
    if (form.bio.length < 150 || form.bio.length > 200) return toast.error("Bio must be 150-200 characters");
    if (!webp) return toast.error("Please choose a profile picture");
    setBusy(true);
    try {
      // 1. Duplicate check: is this SRN already submitted?
      const { data: dup } = await supabase.from("members").select("id").ilike("srn", form.srn).limit(1);
      if (dup?.length) throw new Error("This SRN has already been submitted");

      // 2. Upload the WebP to the 'member-photos' bucket (only now, on final submit)
      const path = `${form.srn.toUpperCase()}-${Date.now()}.webp`;
      const { error: upErr } = await supabase.storage.from("member-photos").upload(path, webp, { contentType: "image/webp" });
      if (upErr) throw upErr;

      // 3. Get the public URL of that file to store in the table
      const { data: { publicUrl } } = supabase.storage.from("member-photos").getPublicUrl(path);

      // 4. Insert the row with status 'pending' so the admin can moderate it
      const { error } = await supabase.from("members").insert({
        ...form, srn: form.srn.toUpperCase(), semester: Number(form.semester), photo_url: publicUrl, status: "pending",
      });
      if (error) throw error;

      toast.success("Submitted! Your profile is pending admin approval.");
      setForm(empty); setWebp(null); setPreview("");
    } catch (err) { toast.error(err.message || "Something went wrong"); }
    setBusy(false);
  }

  const Select = ({ name, label, options }) => (
    <label className="block text-sm">{label}
      <select name={name} value={form[name]} onChange={set} required className="field mt-1">
        <option value="">Select...</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
  const Input = ({ name, label, type = "text", ...rest }) => (
    <label className="block text-sm">{label}
      <input name={name} type={type} value={form[name]} onChange={set} className="field mt-1" {...rest} />
    </label>
  );

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={submit} className="space-y-3">
        <h1 className="text-2xl font-bold">Join the team</h1>
        <Input name="name" label="Full name" required />
        <div className="grid grid-cols-2 gap-3">
          <Select name="domain" label="Domain" options={DOMAINS} />
          <Select name="position" label="Position" options={POSITIONS} />
          <Select name="branch" label="Branch" options={BRANCHES} />
          <Select name="semester" label="Semester" options={SEMESTERS} />
        </div>
        <Input name="srn" label="SRN (e.g. PES1UG23CS001)" required />
        <Input name="email" label="Email" type="email" required />
        <Input name="linkedin_url" label="LinkedIn URL" type="url" />
        <Input name="github_url" label="GitHub URL" type="url" />
        <label className="block text-sm">Short bio ({form.bio.length}/200, minimum 150)
          <textarea name="bio" value={form.bio} onChange={set} maxLength={200} rows={4} required className="field mt-1" />
        </label>
        <label className="block text-sm">Profile picture
          <input type="file" accept=".png,.jpg,.jpeg" onChange={onFile} className="field mt-1" />
        </label>
        <button className="btn w-full" disabled={busy}>{busy ? "Submitting..." : "Submit profile"}</button>
      </form>

      {/* sticky keeps the preview visible while scrolling the long form */}
      <div className="md:sticky md:top-6 md:self-start">
        <p className="mb-2 text-sm text-gray-400">Live preview</p>
        <MemberCard {...form} photo={preview} />
      </div>
    </div>
  );
}
