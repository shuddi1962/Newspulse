export default function Home() {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-(--fg-subtle)">
          Phase 1 · Foundation
        </p>
        <h1 className="mt-6 text-5xl font-semibold text-(--fg-default) sm:text-6xl">
          NewsPulse PRO
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--fg-muted)">
          Scaffold initialised. Design system, fonts, strict TypeScript, and
          authentication are in place. Backend is linked to InsForge. Editorial
          and community modules ship in subsequent phases.
        </p>
        <div className="mt-10 grid grid-cols-1 border border-(--border-subtle) sm:grid-cols-3">
          <dl className="border-b border-(--border-subtle) p-6 sm:border-b-0 sm:border-r">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
              Stack
            </dt>
            <dd className="mt-2 text-sm text-(--fg-default)">
              Next.js · React 19 · TypeScript strict · Tailwind v4
            </dd>
          </dl>
          <dl className="border-b border-(--border-subtle) p-6 sm:border-b-0 sm:border-r">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
              Backend
            </dt>
            <dd className="mt-2 text-sm text-(--fg-default)">
              InsForge — Postgres, Auth, Storage, Realtime, Functions, AI
            </dd>
          </dl>
          <dl className="p-6">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
              Type
            </dt>
            <dd className="mt-2 text-sm text-(--fg-default)">
              Editorial authority · Community super-platform
            </dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
