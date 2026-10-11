"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TeacherLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("maria.ivanova@klad.bg");
  const [password, setPassword] = useState("klad2026");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Неуспешен вход.");
        return;
      }
      router.push("/portal/teacher");
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
        <Label htmlFor="email">Имейл</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 bg-card"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Парола</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {pending ? "Влизане…" : "Влез в портала"}
      </Button>
    </form>
  );
}
