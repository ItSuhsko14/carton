import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Protest Sign Generator
        </h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
