import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useMobileBroadcast } from "@/hooks/useSession";
import { Smartphone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// 간단한 로우패스 필터로 센서 노이즈 제거
function lowPass(prev: number, next: number, factor: number): number {
  return prev + factor * (next - prev);
}

// 각도 차이를 -180~180 범위로 정규화
function angleDelta(from: number, to: number): number {
  let d = to - from;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

const MobileController = () => {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get("code");
  const { sendRotation } = useMobileBroadcast(sessionCode);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  const initialOrientation = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);
  const prevRaw = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);
  const continuous = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const smoothed = useRef({ x: 0, y: 0, z: 0 });
  const rafRef = useRef<number>(0);

  const handleOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      if (!sessionCode || !isActive) return;

      const alpha = e.alpha ?? 0;
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;

      // 연속 각도 추적 (모든 축에 대해 점프 방지)
      if (prevRaw.current !== null) {
        continuous.current.alpha += angleDelta(prevRaw.current.alpha, alpha);
        continuous.current.beta += angleDelta(prevRaw.current.beta, beta);
        continuous.current.gamma += angleDelta(prevRaw.current.gamma, gamma);
      } else {
        continuous.current = { alpha, beta, gamma };
      }
      prevRaw.current = { alpha, beta, gamma };

      if (!initialOrientation.current) {
        initialOrientation.current = { ...continuous.current };
      }

      const ref = initialOrientation.current;
      const rawX = ((continuous.current.beta - ref.beta) * Math.PI) / 180;
      const rawY = ((continuous.current.gamma - ref.gamma) * Math.PI) / 180;
      const rawZ = ((continuous.current.alpha - ref.alpha) * Math.PI) / 180;

      // 로우패스 필터 적용 (0.3 = 부드러움 정도, 낮을수록 부드러움)
      const LP = 0.3;
      smoothed.current.x = lowPass(smoothed.current.x, rawX, LP);
      smoothed.current.y = lowPass(smoothed.current.y, rawY, LP);
      smoothed.current.z = lowPass(smoothed.current.z, rawZ, LP);

      const x = smoothed.current.x;
      const y = smoothed.current.y;
      const z = smoothed.current.z;

      setRotation({ x, y, z });

      // requestAnimationFrame으로 전송 빈도 제어
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        sendRotation({ x, y, z });
      });
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
    initialOrientation.current = null;
    prevRaw.current = null;
    continuous.current = { alpha: 0, beta: 0, gamma: 0 };
    smoothed.current = { x: 0, y: 0, z: 0 };
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

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

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
