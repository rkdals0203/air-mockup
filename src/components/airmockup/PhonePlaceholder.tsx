import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Float } from "@react-three/drei";
import * as THREE from "three";

interface PhonePlaceholderProps {
  rotation: [number, number, number];
  quaternion: { x: number; y: number; z: number; w: number } | null;
  imageUrl: string | null;
  isConnected: boolean;
}

const PhonePlaceholder = ({ rotation, quaternion, imageUrl, isConnected }: PhonePlaceholderProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const screenRef = useRef<THREE.Mesh>(null!);
  const targetQuat = useRef(new THREE.Quaternion());

  const texture = useMemo(() => {
    if (!imageUrl) return null;
    const tex = new THREE.TextureLoader().load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageUrl]);

  useFrame(() => {
    if (!groupRef.current) return;

    if (quaternion) {
      // 모바일: 쿼터니언 직접 적용 (slerp로 부드럽게)
      targetQuat.current.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      groupRef.current.quaternion.slerp(targetQuat.current, 0.5);
    } else {
      // 슬라이더: 오일러 각도로 적용
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0], 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation[1], 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, rotation[2], 0.1);
    }
  });

  const bodyW = 1.6;
  const bodyH = 3.2;
  const bodyD = 0.18;
  const screenW = 1.42;
  const screenH = 2.95;
  const bezel = 0.06;

  const phoneGroup = (
    <group ref={groupRef}>
      <RoundedBox args={[bodyW, bodyH, bodyD]} radius={0.15} smoothness={8}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.2} />
      </RoundedBox>

      <RoundedBox
        args={[screenW + bezel, screenH + bezel, 0.01]}
        position={[0, 0, bodyD / 2 + 0.005]}
        radius={0.08}
        smoothness={4}
      >
        <meshStandardMaterial color="#0a0a0f" metalness={0.5} roughness={0.3} />
      </RoundedBox>

      <mesh ref={screenRef} position={[0, 0, bodyD / 2 + 0.012]}>
        <planeGeometry args={[screenW, screenH]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial
            color="#16162a"
            emissive="#1e1e3f"
            emissiveIntensity={0.3}
          />
        )}
      </mesh>

      <mesh position={[0, screenH / 2 - 0.15, bodyD / 2 + 0.015]}>
        <cylinderGeometry args={[0.04, 0.04, 0.01, 16]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.8} roughness={0.1} />
      </mesh>

      <mesh position={[bodyW / 2 + 0.015, 0.5, 0]}>
        <boxGeometry args={[0.03, 0.3, 0.06]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[-bodyW / 2 - 0.015, 0.6, 0]}>
        <boxGeometry args={[0.03, 0.2, 0.06]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-bodyW / 2 - 0.015, 0.2, 0]}>
        <boxGeometry args={[0.03, 0.2, 0.06]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );

  if (!isConnected) {
    return (
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        {phoneGroup}
      </Float>
    );
  }

  return phoneGroup;
};

export default PhonePlaceholder;
