import { Suspense } from "react";
import { LessonDetail } from "@/components/lesson-detail";
import { StatusBlock } from "@/components/site-chrome";

async function LessonLoader({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ lv?: string }>;
}) {
  const { lessonId } = await params;
  const query = await searchParams;
  return <LessonDetail lessonId={lessonId} initialLevel={query.lv} />;
}

export default function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ lv?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <StatusBlock
          title="Зареждане…"
          description="Отваряме урока и нивата."
        />
      }
    >
      <LessonLoader params={params} searchParams={searchParams} />
    </Suspense>
  );
}
