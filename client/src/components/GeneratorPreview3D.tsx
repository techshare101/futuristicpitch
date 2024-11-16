import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { motion } from "framer-motion-3d";

function Screen() {
  return (
    <mesh>
      <boxGeometry args={[3, 2, 0.1]} />
      <meshPhongMaterial color="#2a0066" />
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 0.6, 0.07]}>
        <planeGeometry args={[2.6, 0.4]} />
        <meshBasicMaterial color="#ff00ff" />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[2.6, 0.8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </mesh>
  );
}

export function GeneratorPreview3D() {
  return (
    <div className="h-[400px] w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Float
          speed={2}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <Screen />
        </Float>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
