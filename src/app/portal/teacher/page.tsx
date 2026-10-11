import { Suspense } from "react";
import { redirect } from "next/navigation";
import { TeacherPortal } from "@/components/teacher-portal";
import { StatusBlock } from "@/components/site-chrome";
import { requireTeacher } from "@/lib/session";
import { getTeacherPortalData } from "@/lib/teacher-dashboard-data";

async function TeacherPortalLoader() {
  const session = await requireTeacher();
  if (!session?.teacherId) {
    redirect("/login/teacher");
  }

  const data = await getTeacherPortalData(session.teacherId);
  if (!data) {
    redirect("/login/teacher");
  }

  return (
    <TeacherPortal
      teacherName={data.teacher.name}
      classLabels={data.classLabels}
      students={data.students}
    />
  );
}

export default function TeacherPortalPage() {
  return (
    <Suspense
      fallback={
        <StatusBlock
          title="Зареждане…"
          description="Отваряме учителския портал."
        />
      }
    >
      <TeacherPortalLoader />
    </Suspense>
  );
}
