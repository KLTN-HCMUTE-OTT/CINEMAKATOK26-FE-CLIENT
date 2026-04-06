"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  // If container is provided and is valid, use it
  // Otherwise, fall back to document.body
  const portalContainer =
    container && container instanceof HTMLElement ? container : document.body;

  return createPortal(children, portalContainer);
}
