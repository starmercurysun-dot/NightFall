import { Suspense } from "react";
import { HomeRedirect } from "@/components/home/HomeRedirect";

function HomeFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-transparent">
      <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeRedirect />
    </Suspense>
  );
}
