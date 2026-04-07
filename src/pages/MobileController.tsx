import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useMobileBroadcast } from "@/hooks/useSession";
import { Smartphone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEG2RAD = Math.PI / 180;

/**
 * DeviceOrientation의 alpha/beta/gamma를 쿼터니언(x,y,z,w)으로 변환
 * W3C spec 기준: ZXY 순서 회전
 */
function orientationToQuaternion(alpha: number, beta: number, gamma: number) {
  const a = alpha * DEG2RAD;
  const b = beta * DEG2RAD;
  const g = gamma * DEG2RAD;

  // ZXY 순서 오일러 → 쿼터니언
  const cx = Math.cos(b / 2);
  const sx = Math.sin(b / 2);
  const cy = Math.cos(g / 2);
  const sy = Math.sin(g / 2);
  const cz = Math.cos(a / 2);
  const sz = Math.sin(a / 2);

  return {
    x: sx * cy * cz - cx * sy * sz,
    y: cx * sy * cz + sx * cy * sz,
    z: cx * cy * sz + sx * sy * cz,
    w: cx * cy * cz - sx * sy * sz,
  };
}

/** 쿼터니언 켤레(역회전) */
function quatConjugate(q: { x: number; y: number; z: number; w: number }) {
  return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
}

/** 쿼터니언 곱셈: a * b */
function quatMultiply(
  a: { x: number; y: number; z: number; w: number },
  b: { x: number; y: number; z: number; w: number }
) {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

const MobileController = () => {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get("code");
  const { sendRotation } = useMobileBroadcast(sessionCode);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayQuat, setDisplayQuat] = useState({ x: 0, y: 0, z: 0, w: 1 });

  const initQuatRef = useRef<{ x: number; y: number; z: number; w: number } | null>(null);

  const handleOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      if (!sessionCode || !isActive) return;

      const alpha = e.alpha ?? 0;
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;

      const currentQuat = orientationToQuaternion(alpha, beta, gamma);

      if (!initQuatRef.current) {
        initQuatRef.current = currentQuat;
      }

      // 상대 회전 = inverse(초기) * 현재
      const relativeQuat = quatMultiply(quatConjugate(initQuatRef.current), currentQuat);

      setDisplayQuat(relativeQuat);
      sendRotation(relativeQuat);
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
    initQuatRef.current = null;
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
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground font-mono">
            <div>x: {displayQuat.x.toFixed(2)}</div>
            <div>y: {displayQuat.y.toFixed(2)}</div>
            <div>z: {displayQuat.z.toFixed(2)}</div>
            <div>w: {displayQuat.w.toFixed(2)}</div>
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
