import { AppHeader, PageShell } from "@/components/site-chrome";
import { StudentLoginForm } from "@/components/student-login-form";
import { LinkButton } from "@/components/link-button";

export default function StudentLoginPage() {
  return (
    <div className="min-h-svh">
      <AppHeader />
      <PageShell className="max-w-md">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brass">
          Вход за ученици
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Към съкровищния лов
        </h1>
        <p className="mt-3 text-muted-foreground">
          Избери паралелка и въведи номера си в класа — той е твоята парола.
        </p>
        <div className="mt-8">
          <StudentLoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Учител ли си?{" "}
          <LinkButton href="/login/teacher" variant="link" className="h-auto px-0">
            Вход за учители
          </LinkButton>
        </p>
      </PageShell>
    </div>
  );
}
