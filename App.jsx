import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';

// คอมโพเนนต์โหลดโมเดล 3D
function DuckModel() {
  const { scene } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb');
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive object={scene} scale={0.4} position={[0, -0.5, 0]} />
    </Float>
  );
}

export default function App() {
  const containerRef = useRef();
  const [arReady, setArReady] = useState(false);

  useEffect(() => {
    // ตรวจสอบว่าสคริปต์ MindAR โหลดเสร็จหรือยัง
    if (!window.MINDAR || !window.MINDAR.PROD) {
      console.error("MindAR script not found. Check index.html");
      return;
    }

    // 1. ตั้งค่า MindAR World Tracking
    const mindarThree = new window.MINDAR.PROD.MindARThree({
      container: containerRef.current,
    });

    const { renderer, scene, camera } = mindarThree;

    // 2. เริ่มต้นระบบ AR
    const startAR = async () => {
      try {
        await mindarThree.start();
        setArReady(true);

        // วนลูปการ Render พื้นหลังของ MindAR
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      } catch (err) {
        console.error("AR Start failed:", err);
      }
    };

    startAR();

    // Clean up เมื่อปิดหน้าจอ
    return () => {
      if (mindarThree) {
        mindarThree.stop();
        renderer.setAnimationLoop(null);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: 'black' }}>
      
      {/* ส่วนแสดงผลกล้อง (MindAR จะจัดการตรงนี้) */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* เลเยอร์ของ React Three Fiber ที่จะลอยทับบนกล้อง */}
      {arReady && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none' // ยอมให้สัมผัสทะลุไปยัง Layer กล้องได้
        }}>
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} />
            
            {/* วางโมเดลในตำแหน่งที่มองเห็นได้ง่ายในตอนแรก */}
            <group position={[0, 0, -3]}>
              <DuckModel />
            </group>
          </Canvas>
        </div>
      )}

      {/* UI ปลอบใจตอนโหลด */}
      {!arReady && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', 
          transform: 'translate(-50%, -50%)', color: 'white',
          fontFamily: 'sans-serif', textAlign: 'center'
        }}>
          <p>กำลังขออนุญาตเปิดกล้อง...</p>
          <small>(ต้องใช้ HTTPS เท่านั้นบน iOS)</small>
        </div>
      )}
    </div>
  );
}