import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useMobileBroadcast } from "@/hooks/useSession";
import { Smartphone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEG2RAD = Math.PI / 180;

const MobileController = () => {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get("code");
  const { sendRotation } = useMobileBroadcast(sessionCode);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  const initRef = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);
  // alpha(0~360)만 연속 추적 필요
  const prevAlpha = useRef<number | null>(null);
  const contAlpha = useRef(0);

  const handleOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      if (!sessionCode || !isActive) return;

      const alpha = e.alpha ?? 0;
      const beta = e.beta ?? 0;   // -180 ~ 180, 연속
      const gamma = e.gamma ?? 0; // -90 ~ 90, 연속

      // alpha만 래핑 처리 (0→360 점프 방지)
      if (prevAlpha.current !== null) {
        let d = alpha - prevAlpha.current;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        contAlpha.current += d;
      } else {
        contAlpha.current = alpha;
      }
      prevAlpha.current = alpha;

      if (!initRef.current) {
        initRef.current = { alpha: contAlpha.current, beta, gamma };
      }

      const ref = initRef.current;
      const x = (beta - ref.beta) * DEG2RAD;
      const y = (gamma - ref.gamma) * DEG2RAD;
      const z = (contAlpha.current - ref.alpha) * DEG2RAD;

      setRotation({ x, y, z });
      sendRotation({ x, y, z });
    },
    [sessionCode, isActive, sendRotation]
  );

  const startGyro = async () => {
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm !== "granted") {
          setError("자이로스코프 권한이 거부되었습니다.");
          return;
        }
      } catch {
        setError("권한 요청에 실패했습니다.");
        return;
      }
    }
    resetOrientation();
    setIsActive(true);
  };

  const resetOrientation = () => {
    initRef.current = null;
    prevAlpha.current = null;
    contAlpha.current = 0;
  };

  useEffect(() => {
    if (isActive) {
      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, [isActive, handleOrientation]);

  if (!sessionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <Smartphone className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-bold text-foreground">세션 코드가 없습니다</h1>
          <p className="text-muted-foreground text-sm">
            PC에서 QR 코드를 스캔하여 접속하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 gap-6">
      <div className="text-center space-y-2">
        <Smartphone className="w-10 h-10 text-primary mx-auto" />
        <h1 className="text-xl font-bold text-foreground">AirMockup 컨트롤러</h1>
        <p className="text-sm text-muted-foreground">
          세션: <span className="font-mono text-foreground">{sessionCode}</span>
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isActive ? (
        <Button onClick={startGyro} size="lg" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          자이로스코프 시작
        </Button>
      ) : (
        <div className="space-y-4 text-center">
          <div className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
            연결됨 — 폰을 움직여 보세요
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground font-mono">
            <div>X: {rotation.x.toFixed(2)}</div>
            <div>Y: {rotation.y.toFixed(2)}</div>
            <div>Z: {rotation.z.toFixed(2)}</div>
          </div>
          <Button variant="outline" onClick={resetOrientation}>
            원점 리셋
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileController;
