import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useEffect, useRef, useState } from "react";

function Screen() {
  return (
    <mesh>
      <boxGeometry args={[3, 2, 0.1]} />
      <meshStandardMaterial color="#2a0066" metalness={0.6} roughness={0.2} />
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 0.6, 0.07]}>
        <planeGeometry args={[2.6, 0.4]} />
        <meshStandardMaterial 
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[2.6, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} />
      </mesh>
    </mesh>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial wireframe color="#ff00ff" />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <spotLight 
        position={[5, 5, 5]} 
        angle={0.4} 
        penumbra={1} 
        intensity={1} 
        castShadow 
      />
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
        autoRotate
        autoRotateSpeed={1}
      />
    </>
  );
}

function Preview3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      setIsSupported(false);
      return;
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        const canvases = containerRef.current.getElementsByTagName('canvas');
        Array.from(canvases).forEach(canvas => {
          const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
          if (gl) {
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) {
              ext.loseContext();
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            canvas.width = 1;
            canvas.height = 1;
          }
        });
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-white/60">
        <p>Your browser doesn't support WebGL. Please try a different browser.</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full relative" ref={containerRef}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true
        }}
        dpr={[1, 2]}
        legacy={false}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <color attach="background" args={['transparent']} />
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

function FallbackComponent({ error }: { error: Error }) {
  return (
    <div className="h-[400px] w-full flex items-center justify-center text-white/60">
      <div className="text-center">
        <p className="mb-2">3D preview unavailable</p>
        <p className="text-sm opacity-60">{error.message}</p>
      </div>
    </div>
  );
}

export function GeneratorPreview3D() {
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error) => {
        console.error('Error in 3D Preview:', error);
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      <Suspense fallback={
        <div className="h-[400px] w-full flex items-center justify-center">
          <div className="text-white/60">Loading 3D preview...</div>
        </div>
      }>
        <Preview3D />
      </Suspense>
    </ErrorBoundary>
  );
}
