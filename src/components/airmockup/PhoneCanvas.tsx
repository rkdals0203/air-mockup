import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import PhonePlaceholder from "./PhonePlaceholder";

interface PhoneCanvasProps {
  rotation: [number, number, number];
  imageUrl: string | null;
  isConnected: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const PhoneCanvas = ({ rotation, imageUrl, isConnected, canvasRef }: PhoneCanvasProps) => {
  return (
    <div className="relative w-full h-full">
      {/* Premium gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, hsl(250 40% 15%) 0%, hsl(220 20% 6%) 70%, hsl(220 15% 4%) 100%)",
        }}
      />
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        className="relative z-10"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 2, 4]} intensity={0.3} color="#a0a0ff" />

        <PhonePlaceholder
          rotation={rotation}
          imageUrl={imageUrl}
          isConnected={isConnected}
        />

        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={8}
          blur={2.5}
          far={4}
        />

        <Environment preset="city" />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
};

export default PhoneCanvas;
