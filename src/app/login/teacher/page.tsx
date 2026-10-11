import { AppHeader, PageShell } from "@/components/site-chrome";
import { TeacherLoginForm } from "@/components/teacher-login-form";
import { LinkButton } from "@/components/link-button";

export default function TeacherLoginPage() {
  return (
    <div className="min-h-svh">
      <AppHeader />
      <PageShell className="max-w-md">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brass">
          Вход за учители
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Учителски портал
        </h1>
        <p className="mt-3 text-muted-foreground">
          Въведи служебния имейл и парола. След вход виждаш само своите паралелки.
        </p>
        <div className="mt-8">
          <TeacherLoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Не си учител?{" "}
          <LinkButton href="/login/student" variant="link" className="h-auto px-0">
            Вход за ученици
          </LinkButton>
        </p>
      </PageShell>
    </div>
  );
}
