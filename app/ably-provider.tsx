"use client";
import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { useMemo } from "react";
import { useAuth } from "@/hooks";

export default function RealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgId } = useAuth();

  const client = useMemo(() => {
    return new Ably.Realtime({
      authUrl: "/api/ably/auth",
      authMethod: "GET",
      autoConnect: false,
    });
  }, []);

  if (orgId && client.connection.state === "initialized") {
    client.connect();
  }

  if (!orgId) {
    return <>{children}</>;
  }

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={`org-${orgId}`}>{children}</ChannelProvider>
    </AblyProvider>
  );
}
