import { Suspense } from "react";
import { StudentPlay } from "@/components/student-play";
import { StatusBlock } from "@/components/site-chrome";

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-svh px-4 py-10">
          <StatusBlock
            title="Отваряме станцията…"
            description="Зареждаме задачата от QR кода."
          />
        </main>
      }
    >
      <StudentPlay />
    </Suspense>
  );
}
