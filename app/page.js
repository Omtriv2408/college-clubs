import { redirect } from "next/navigation";
// The home page just sends visitors to the public directory.
export default function Home() { redirect("/team"); }
