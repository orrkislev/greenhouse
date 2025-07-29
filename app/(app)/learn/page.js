'use client';

import Research from "./components/Research";
import Study from "./components/Study";

export default function Home() {

  return (
    <div className="flex items-start justify-center mt-8">
      <div className="w-7xl flex flex-col gap-4">
        <Research />
        <Study />
      </div>
    </div>
  )
}
