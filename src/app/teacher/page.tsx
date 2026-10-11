import { Suspense } from "react";
import { TeacherDashboard } from "@/components/teacher-dashboard";
import { StatusBlock } from "@/components/site-chrome";

export default function TeacherPage() {
  return (
    <Suspense
      fallback={
        <StatusBlock
          title="Зареждане…"
          description="Подготвяме кабинета на учителя."
        />
      }
    >
      <TeacherDashboard />
    </Suspense>
  );
}
