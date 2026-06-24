export default function Loading() {
  return (
    <div className="pt-40 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Hero skeleton */}
        <div className="flex flex-col items-center gap-5 mb-20">
          <div
            className="h-4 w-36 rounded-full animate-pulse"
            style={{ background: "var(--surface-raised)" }}
          />
          <div
            className="h-12 w-2/3 rounded-2xl animate-pulse"
            style={{ background: "var(--surface-raised)" }}
          />
          <div
            className="h-8 w-1/2 rounded-2xl animate-pulse"
            style={{ background: "var(--surface)" }}
          />
          <div className="flex gap-3 mt-4">
            <div className="h-11 w-36 rounded-xl animate-pulse" style={{ background: "var(--surface-raised)" }} />
            <div className="h-11 w-36 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
          </div>
        </div>

        {/* Content skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl animate-pulse"
              style={{ background: "var(--surface)", animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
