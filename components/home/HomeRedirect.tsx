"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionEmail } from "@/lib/storage";

export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      const email = getSessionEmail();
      const target = email ? "/tracker" : "/login";
      router.replace(target);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-transparent">
      <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}
