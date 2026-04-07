import { useState, useRef, useCallback } from "react";
import Sidebar from "@/components/airmockup/Sidebar";
import PhoneCanvas from "@/components/airmockup/PhoneCanvas";
import { useSession } from "@/hooks/useSession";

const Index = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [manualRotation, setManualRotation] = useState<[number, number, number]>([0, 0, 0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { sessionCode, isConnected, remoteRotation } = useSession();

  const handleRotationChange = useCallback((axis: number, value: number) => {
    setManualRotation((prev) => {
      const next = [...prev] as [number, number, number];
      next[axis] = value;
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "airmockup-capture.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        imageUrl={imageUrl}
        onImageUpload={setImageUrl}
        sessionCode={sessionCode}
        isConnected={isConnected}
        rotation={isConnected ? [0, 0, 0] : manualRotation}
        onRotationChange={handleRotationChange}
        onExport={handleExport}
      />
      <main className="flex-1 h-screen">
        <PhoneCanvas
          rotation={manualRotation}
          quaternion={isConnected ? remoteRotation : null}
          imageUrl={imageUrl}
          isConnected={isConnected}
          canvasRef={canvasRef}
        />
      </main>
    </div>
  );
};

export default Index;
