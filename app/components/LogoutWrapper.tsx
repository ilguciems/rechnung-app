"use client";

import { useEffect } from "react";

export default function LogoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const bc = new BroadcastChannel("invoice-app");

    bc.onmessage = (event) => {
      if (event.data.type === "LOGOUT") {
        const currentPath = window.location.pathname + window.location.search;

        if (currentPath.includes("/sign-in")) return;

        const encodedPath = encodeURIComponent(currentPath);

        window.location.href = `/sign-in?callbackUrl=${encodedPath}&reason=session_expired`;
      }
    };

    return () => bc.close();
  }, []);

  return <>{children}</>;
}
