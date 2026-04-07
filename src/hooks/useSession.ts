import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function useSession() {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteRotation, setRemoteRotation] = useState<[number, number, number]>([0, 0, 0]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Create session on mount
  useEffect(() => {
    const code = generateCode();
    supabase
      .from("mockup_sessions")
      .insert({ session_code: code })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to create session:", error);
          return;
        }
        setSessionCode(data.session_code);
        setSessionId(data.id);
      });

    return () => {
      // Cleanup session on unmount
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mockup_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setIsConnected(row.is_connected);
          setRemoteRotation([row.rotation_x, row.rotation_y, row.rotation_z]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { sessionCode, sessionId, isConnected, remoteRotation };
}

/** Used by the mobile page to update rotation */
export async function updateSessionRotation(
  sessionCode: string,
  rotation: { x: number; y: number; z: number }
) {
  await supabase
    .from("mockup_sessions")
    .update({
      rotation_x: rotation.x,
      rotation_y: rotation.y,
      rotation_z: rotation.z,
      is_connected: true,
    })
    .eq("session_code", sessionCode);
}

export async function disconnectSession(sessionCode: string) {
  await supabase
    .from("mockup_sessions")
    .update({ is_connected: false })
    .eq("session_code", sessionCode);
}
