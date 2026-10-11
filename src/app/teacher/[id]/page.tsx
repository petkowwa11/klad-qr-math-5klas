import { Suspense } from "react";
import { HuntEditor } from "@/components/hunt-editor";
import { StatusBlock } from "@/components/site-chrome";

async function HuntEditorLoader({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <HuntEditor huntId={id} initialPreview={query.preview === "1"} />;
}

export default function TeacherHuntPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <StatusBlock
          title="Зареждане…"
          description="Отваряме маршрута за редакция."
        />
      }
    >
      <HuntEditorLoader params={params} searchParams={searchParams} />
    </Suspense>
  );
}
