"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PARALLELS = ["а", "б", "в", "г"] as const;

export function StudentLoginForm() {
  const router = useRouter();
  const [grade] = useState("5");
  const [parallel, setParallel] = useState<(typeof PARALLELS)[number]>("а");
  const [password, setPassword] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: Number(grade), parallel, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Неуспешен вход.");
        return;
      }
      router.push("/portal/student");
      router.refresh();
    } catch {
      setError("Мрежова грешка. Опитай отново.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="grade">Клас</Label>
        <select
          id="grade"
          value={grade}
          disabled
          className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
        >
          <option value="5">5. клас</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="parallel">Паралелка</Label>
        <select
          id="parallel"
          value={parallel}
          onChange={(e) => setParallel(e.target.value as (typeof PARALLELS)[number])}
          className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
        >
          {PARALLELS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Номер в класа (парола)</Label>
        <Input
          id="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="1, 2 или 3"
          className="h-11 bg-card"
          required
        />
      </div>
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "Влизане…" : "Започни лова"}
      </Button>
    </form>
  );
}
