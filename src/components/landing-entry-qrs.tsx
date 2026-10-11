"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export function LandingEntryQrs() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const studentUrl = origin ? `${origin}/login/student` : "/login/student";
  const teacherUrl = origin ? `${origin}/login/teacher` : "/login/teacher";

  return (
    <div className="animate-fade-up-delay-2 mt-10 grid w-full max-w-xl gap-5 sm:grid-cols-2">
      <Link
        href="/login/student"
        className="group flex flex-col items-center gap-3 rounded-2xl border border-parchment/25 bg-parchment/10 px-4 py-5 text-center backdrop-blur transition hover:bg-parchment/15"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
          Ученици
        </p>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          {origin ? (
            <QRCodeSVG value={studentUrl} size={148} level="M" />
          ) : (
            <div className="size-[148px] animate-pulse bg-muted" />
          )}
        </div>
        <p className="font-display text-lg font-semibold text-parchment">
          Вход за ученици
        </p>
        <p className="text-xs text-parchment/70 break-all">{studentUrl}</p>
      </Link>

      <Link
        href="/login/teacher"
        className="group flex flex-col items-center gap-3 rounded-2xl border border-parchment/25 bg-parchment/10 px-4 py-5 text-center backdrop-blur transition hover:bg-parchment/15"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
          Учители
        </p>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          {origin ? (
            <QRCodeSVG value={teacherUrl} size={148} level="M" />
          ) : (
            <div className="size-[148px] animate-pulse bg-muted" />
          )}
        </div>
        <p className="font-display text-lg font-semibold text-parchment">
          Вход за учители
        </p>
        <p className="text-xs text-parchment/70 break-all">{teacherUrl}</p>
      </Link>
    </div>
  );
}
