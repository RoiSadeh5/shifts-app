import Link from "next/link";
import Button from "./_components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative text-center">
        <p
          className="text-[120px] md:text-[180px] font-bold leading-none tracking-tighter text-gradient-accent"
        >
          404
        </p>
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tight -mt-4"
          style={{ color: "var(--text-primary)" }}
        >
          This request couldn&apos;t be found.
        </h1>
        <p
          className="mt-4 text-base max-w-md mx-auto leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          The page you&apos;re looking for has been moved, deleted, or never
          existed. Unlike your security requests — those, we never lose.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/">Back to home</Button>
          <Link
            href="/product"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Explore the product →
          </Link>
        </div>
      </div>
    </section>
  );
}
