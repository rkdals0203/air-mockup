import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function useSession() {
  const [sessionCode] = useState(() => generateCode());
  const [isConnected, setIsConnected] = useState(false);
  const [remoteRotation, setRemoteRotation] = useState<{ x: number; y: number; z: number; w: number }>({ x: 0, y: 0, z: 0, w: 1 });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`session-${sessionCode}`);

    channel
      .on("broadcast", { event: "rotation" }, ({ payload }) => {
        setRemoteRotation({ x: payload.x, y: payload.y, z: payload.z, w: payload.w });
        setIsConnected(true);

        // 2초간 데이터가 안 오면 연결 해제로 간주
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsConnected(false), 2000);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [sessionCode]);

  return { sessionCode, isConnected, remoteRotation };
}

/** Used by the mobile page to send rotation via broadcast */
export function useMobileBroadcast(sessionCode: string | null) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!sessionCode) return;

    const channel = supabase.channel(`session-${sessionCode}`);
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode]);

  const sendRotation = useCallback(
    (rotation: { x: number; y: number; z: number }) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "rotation",
        payload: rotation,
      });
    },
    []
  );

  return { sendRotation };
}
