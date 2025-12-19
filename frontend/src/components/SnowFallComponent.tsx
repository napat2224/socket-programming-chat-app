"use client";

import dynamic from "next/dynamic";

const Snowfall = dynamic(() => import("react-snowfall"), { ssr: false });

export default function SnowfallComponent() {
  return <Snowfall />;
}
