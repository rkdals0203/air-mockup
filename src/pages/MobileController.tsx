import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useMobileBroadcast } from "@/hooks/useSession";
import { Smartphone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

const DEG2RAD = Math.PI / 180;

// Three.js DeviceOrientationControls 기준 쿼터니언 변환
// 디바이스 좌표계 → Three.js 좌표계
const Q_SCREEN = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -90° around X

function deviceOrientationToQuat(alpha: number, beta: number, gamma: number): THREE.Quaternion {
  const euler = new THREE.Euler(beta * DEG2RAD, alpha * DEG2RAD, -gamma * DEG2RAD, "YXZ");
  const q = new THREE.Quaternion().setFromEuler(euler);
  q.multiply(Q_SCREEN);
  return q;
}

const MobileController = () => {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get("code");
  const { sendRotation } = useMobileBroadcast(sessionCode);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const initQuatInverse = useRef<THREE.Quaternion | null>(null);

  const handleOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      if (!sessionCode || !isActive) return;

      const alpha = e.alpha ?? 0;
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;

      const currentQuat = deviceOrientationToQuat(alpha, beta, gamma);

      if (!initQuatInverse.current) {
        initQuatInverse.current = currentQuat.clone().invert();
      }

      // 상대 회전 = inverse(초기) * 현재
      const relativeQuat = initQuatInverse.current.clone().multiply(currentQuat);

      setStatus(`${relativeQuat.x.toFixed(2)}, ${relativeQuat.y.toFixed(2)}, ${relativeQuat.z.toFixed(2)}`);
      sendRotation({
        x: relativeQuat.x,
        y: relativeQuat.y,
        z: relativeQuat.z,
        w: relativeQuat.w,
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
    initQuatInverse.current = null;
    setIsActive(true);
  };

  const resetOrientation = () => {
    initQuatInverse.current = null;
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
          <p className="text-xs text-muted-foreground font-mono">{status}</p>
          <Button variant="outline" onClick={resetOrientation}>
            원점 리셋
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileController;
