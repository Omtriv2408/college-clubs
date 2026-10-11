import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import Nav from "../components/Nav";

const font = Space_Grotesk({ subsets: ["latin"], variable: "--font-main" });

export const metadata = { title: "The Embrione | Meet The Team" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${font.variable} font-sans`}>
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        {/* Toaster renders all toast() popups used across the app */}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
