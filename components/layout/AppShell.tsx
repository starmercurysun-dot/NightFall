"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionEmail } from "@/lib/storage";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getSessionEmail()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-transparent">
        <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-transparent">
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
        {children}
      </main>
    </div>
  );
}
