"use client";

import { Presentation } from "./presentation";
import { slides } from "@/components/slides";

/** The full 21-slide AuditLinkTrail seed pitch deck. */
export function Deck() {
  return <Presentation slides={slides} />;
}
