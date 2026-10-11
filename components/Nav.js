import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-edge">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/team" className="text-lg font-bold">Embrione</Link>
        <div className="flex gap-5 text-sm text-gray-300">
          <Link href="/team" className="hover:text-white">Team</Link>
          <Link href="/register" className="hover:text-white">Register</Link>
          <Link href="/admin" className="hover:text-white">Admin</Link>
        </div>
      </nav>
    </header>
  );
}
