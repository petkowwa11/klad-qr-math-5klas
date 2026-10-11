import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-baseline gap-2 font-display tracking-tight transition-opacity hover:opacity-90",
        tone === "light" ? "text-parchment" : "text-forest",
        className,
      )}
    >
      <span className="text-2xl font-semibold sm:text-3xl">КЛАД</span>
      <span
        className={cn(
          "hidden text-xs font-medium uppercase tracking-[0.18em] sm:inline",
          tone === "light" ? "text-parchment/70" : "text-muted-foreground",
        )}
      >
        Лов на съкровища
      </span>
    </Link>
  );
}

export function AppHeader({
  tone = "dark",
  action,
}: {
  tone?: "dark" | "light";
  action?: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        "no-print flex items-center justify-between gap-4 px-4 py-4 sm:px-6",
        tone === "light" ? "text-parchment" : "text-foreground",
      )}
    >
      <BrandMark tone={tone} />
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/login/student"
          className={cn(
            "text-sm font-medium underline-offset-4 transition hover:underline",
            tone === "light" ? "text-parchment/85" : "text-foreground/80",
          )}
        >
          Ученици
        </Link>
        <Link
          href="/login/teacher"
          className={cn(
            "hidden text-sm font-medium underline-offset-4 transition hover:underline sm:inline",
            tone === "light" ? "text-parchment/85" : "text-foreground/80",
          )}
        >
          Учители
        </Link>
        <Link
          href="/curriculum"
          className={cn(
            "hidden text-sm font-medium underline-offset-4 transition hover:underline md:inline",
            tone === "light" ? "text-parchment/85" : "text-foreground/80",
          )}
        >
          Програма
        </Link>
        {action}
      </nav>
    </header>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-4 pb-16 pt-2 sm:px-6", className)}>
      {children}
    </div>
  );
}

export function StatusBlock({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center animate-fade-up">
      <h2 className="font-display text-2xl font-semibold text-forest">{title}</h2>
      <p className="mt-3 text-muted-foreground">{description}</p>
      {action ? <div className="mt-6 flex justify-center gap-3">{action}</div> : null}
    </div>
  );
}
