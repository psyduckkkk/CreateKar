export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8 opacity-80">
        {/* Skeleton hero */}
        <div className="h-10 w-48 rounded bg-surface-elevated" />
        <div className="h-16 w-3/4 rounded bg-surface-elevated" />
        <div className="h-6 w-1/2 rounded bg-surface-elevated" />

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="h-64 rounded-xl border border-border-subtle bg-surface p-6 space-y-4">
            <div className="h-6 w-1/3 rounded bg-surface-elevated" />
            <div className="h-24 w-full rounded bg-surface-elevated" />
            <div className="h-8 w-1/2 rounded bg-surface-elevated" />
          </div>
          <div className="h-64 rounded-xl border border-border-subtle bg-surface p-6 space-y-4">
            <div className="h-6 w-1/3 rounded bg-surface-elevated" />
            <div className="h-24 w-full rounded bg-surface-elevated" />
            <div className="h-8 w-1/2 rounded bg-surface-elevated" />
          </div>
          <div className="h-64 rounded-xl border border-border-subtle bg-surface p-6 space-y-4">
            <div className="h-6 w-1/3 rounded bg-surface-elevated" />
            <div className="h-24 w-full rounded bg-surface-elevated" />
            <div className="h-8 w-1/2 rounded bg-surface-elevated" />
          </div>
        </div>
      </div>
    </div>
  );
}
