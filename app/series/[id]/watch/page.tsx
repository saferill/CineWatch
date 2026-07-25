import React, { Suspense } from "react";
import WatchClientContent from "./watch-client";

export function generateStaticParams() {
  return [{ id: '1399' }];
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <WatchClientContent />
    </Suspense>
  );
}
