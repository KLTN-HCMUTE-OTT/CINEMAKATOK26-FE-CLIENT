"use client";

import { useEffect } from "react";
import { hydrateStores } from "@/store";

export function StoreHydrator() {
  useEffect(() => {
    hydrateStores();
  }, []);

  return null;
}
