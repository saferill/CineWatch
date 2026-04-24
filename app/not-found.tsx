import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { IconHome, IconSearch } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-9xl font-bold text-accent">404</h1>
        <p className="text-2xl font-semibold mt-4">Page Not Found</p>
        <p className="text-zinc-500 mt-2 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
          >
            <IconHome className="w-5 h-5" stroke={1.5} />
            Go Home
          </Link>
          <Link
            href="/#search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass font-medium hover:bg-white/[0.08] transition-colors"
          >
            <IconSearch className="w-5 h-5" stroke={1.5} />
            Search
          </Link>
        </div>
      </main>
    </>
  );
}