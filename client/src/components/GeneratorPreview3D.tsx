import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group } from "three";

function Screen() {
  const [hovered, setHovered] = useState(false);
  const { gl } = useThree();
  
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log("WebGL context lost");
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored");
      gl.setSize(gl.domElement.width, gl.domElement.height);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);
  
  return (
    <group>
      <mesh onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
        <boxGeometry args={[4, 2.5, 0.1]} />
        <meshStandardMaterial color="#2a0066" metalness={0.8} roughness={0.2} />
        
        <group position={[0, 0, 0.06]} scale={hovered ? 1.1 : 1}>
          <mesh position={[0, 0.6, 0]}>
            <planeGeometry args={[3.6, 0.6]} />
            <meshStandardMaterial 
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {[-1, 0, 1].map((x, i) => (
            <mesh key={i} position={[x, -0.3, 0]} scale={0.3}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
            </mesh>
          ))}
        </group>
      </mesh>
      
      <group position={[0, 0, 0.5]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[
            Math.sin(i * Math.PI * 0.4) * 2,
            Math.cos(i * Math.PI * 0.4) * 1.2,
            i * 0.2
          ]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Scene() {
  const groupRef = useRef<Group>(null);
  const { gl } = useThree();
  
  useEffect(() => {
    return () => {
      gl.dispose();
    };
  }, [gl]);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.z = Math.sin(t * 0.5) * 0.3;
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.2;
    }
  });

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
        <group ref={groupRef}>
          <Screen />
        </group>
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

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial wireframe color="#ff00ff" />
    </mesh>
  );
}

function Preview3D() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (containerRef.current) {
        const canvases = containerRef.current.getElementsByTagName('canvas');
        Array.from(canvases).forEach(canvas => {
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (gl) {
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
            gl.getExtension('WEBGL_debug_renderer_info');
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            if ('dispose' in gl) {
              (gl as any).dispose();
            }
          }
        });
      }
    };
  }, []);

  if (!mounted) return null;

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
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
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
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
        >
          Try Again
        </button>
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
          <div className="text-white/60">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4" />
            Loading 3D preview...
          </div>
        </div>
      }>
        <Preview3D />
      </Suspense>
    </ErrorBoundary>
  );
}
