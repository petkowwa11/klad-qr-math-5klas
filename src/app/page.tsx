import { AppHeader } from "@/components/site-chrome";
import { HeroTrail } from "@/components/hero-trail";
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
                href="/teacher"
                className="bg-brass text-brass-foreground hover:bg-brass/90"
                size="sm"
              >
                Отвори кабинета
              </LinkButton>
            }
          />

          <section className="flex flex-1 flex-col justify-end px-4 pb-14 pt-10 sm:justify-center sm:px-10 sm:pb-20 lg:px-16">
            <div className="max-w-xl">
              <p className="animate-fade-up font-display text-5xl font-semibold tracking-tight text-parchment sm:text-7xl">
                КЛАД
              </p>
              <h1 className="animate-fade-up-delay mt-5 max-w-[18ch] font-display text-2xl font-medium leading-snug text-parchment sm:text-4xl">
                Лов на съкровища с QR за математика в 5. клас
              </h1>
              <p className="animate-fade-up-delay-2 mt-4 max-w-[36ch] text-base leading-relaxed text-parchment/80 sm:text-lg">
                Учителят нарежда станциите. Ученикът сканира, решава и продължава по
                маршрута — самостоятелно и с подсказка, когато трябва.
              </p>
              <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
                <LinkButton
                  href="/teacher"
                  size="lg"
                  className="bg-brass text-brass-foreground hover:bg-brass/90 h-11 px-5 text-base"
                >
                  Създай лов
                </LinkButton>
                <LinkButton
                  href="/teacher?demo=1"
                  size="lg"
                  variant="outline"
                  className="h-11 border-parchment/35 bg-transparent px-5 text-base text-parchment hover:bg-parchment/10 hover:text-parchment"
                >
                  Виж демо лов
                </LinkButton>
              </div>
            </div>
          </section>
        </div>
      </main>

      <section className="border-t border-white/10 bg-[#0a2f2c] px-4 py-16 text-parchment sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold text-parchment sm:text-4xl">
              Методическият модел в действие
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-parchment/75">
              КЛАД е практическата среда към модела „Лов на съкровища“: независима работа
              по математика чрез физически станции и цифрови задачи. Подходящ за урок,
              занималня или открит урок в 5. клас.
            </p>
          </div>
          <ol className="space-y-4 text-sm leading-relaxed text-parchment/85">
            <li>
              <span className="font-semibold text-brass">1.</span> Учителят създава маршрут и
              разпечатва QR за всяка станция.
            </li>
            <li>
              <span className="font-semibold text-brass">2.</span> Ученикът сканира, решава и
              ползва подсказка само ако се затрудни.
            </li>
            <li>
              <span className="font-semibold text-brass">3.</span> Следващата станция води
              напред по „съкровищния“ маршрут до финала.
            </li>
          </ol>
        </div>
        <p className="mx-auto mt-12 max-w-5xl text-xs text-parchment/55">
          Практическа част · магистърска теза на Тони Петкова
        </p>
      </section>
    </div>
  );
}
