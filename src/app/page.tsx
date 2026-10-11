import { AppHeader } from "@/components/site-chrome";
import { HeroTrail } from "@/components/hero-trail";
import { LandingEntryQrs } from "@/components/landing-entry-qrs";
import { LinkButton } from "@/components/link-button";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="relative min-h-svh overflow-hidden klad-atmosphere text-parchment">
        <div className="absolute inset-0 klad-map-overlay" aria-hidden="true" />
        <HeroTrail />

        <div className="relative z-10 flex min-h-svh flex-col">
          <AppHeader
            tone="light"
            action={
              <LinkButton
                href="/login/teacher"
                className="bg-brass text-brass-foreground hover:bg-brass/90"
                size="sm"
              >
                Вход учител
              </LinkButton>
            }
          />

          <section className="flex flex-1 flex-col justify-center px-4 pb-12 pt-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl">
              <p className="animate-fade-up font-display text-5xl font-semibold tracking-tight text-parchment sm:text-7xl">
                КЛАД
              </p>
              <h1 className="animate-fade-up-delay mt-4 max-w-[20ch] font-display text-2xl font-medium leading-snug text-parchment sm:text-4xl">
                Сканирай QR и влез в лова
              </h1>
              <p className="animate-fade-up-delay-2 mt-3 max-w-[38ch] text-base leading-relaxed text-parchment/80 sm:text-lg">
                Два входа за класната стая — ученици и учители. Математика за 5. клас
                през станции със съкровища.
              </p>
              <LandingEntryQrs />
            </div>
          </section>
        </div>
      </main>

      <section className="border-t border-white/10 bg-[#0a2f2c] px-4 py-14 text-parchment sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-semibold text-parchment">
            Как работи
          </h2>
          <ol className="mt-6 grid gap-4 text-sm leading-relaxed text-parchment/85 md:grid-cols-3">
            <li>
              <span className="font-semibold text-brass">1.</span> Ученикът сканира QR
              „Ученици“, избира паралелка и номер в класа.
            </li>
            <li>
              <span className="font-semibold text-brass">2.</span> Решава станции от
              учебната програма; отговорите се проверяват и напредъкът се записва.
            </li>
            <li>
              <span className="font-semibold text-brass">3.</span> Учителят влиза през
              своя QR и вижда къде класът има пропуски.
            </li>
          </ol>
          <p className="mt-10 text-xs text-parchment/55">
            Практическа част · магистърска теза на Тони Петкова
          </p>
        </div>
      </section>
    </div>
  );
}
