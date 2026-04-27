import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WaterShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uMouse: { value: new THREE.Vector2(-1, -1) },
    uBaseColor: { value: new THREE.Color("#f8f6f0") }, // 宣纸米白底色
    uInkColor: { value: new THREE.Color("#8299a8") }, // 淡青灰墨色
    uTransitionProgress: { value: 0 }, // 0 to 1, 用于衔接第二幕
    uParticleAlpha: { value: 1 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform vec3 uBaseColor;
    uniform vec3 uInkColor;
    uniform float uTransitionProgress;

    varying vec2 vUv;

    // 基础噪声函数 (Simplex / Perlin noise approximation)
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // 屏幕比例修正
      vec2 st = vUv * uResolution / min(uResolution.x, uResolution.y);
      vec2 mouseSt = uMouse * uResolution / min(uResolution.x, uResolution.y);
      
      // 鼠标交互：墨晕波纹
      float dist = distance(st, mouseSt);
      float mouseInfluence = smoothstep(0.3, 0.0, dist) * 0.5;
      
      // 随时间流动的水墨纹理
      float n1 = snoise(st * 1.5 + uTime * 0.1);
      float n2 = snoise(st * 3.0 - uTime * 0.15 + n1);
      float inkIntensity = smoothstep(0.0, 1.0, n2) * 0.4 + mouseInfluence;
      
      // 添加纸张肌理 (细微噪点)
      float paperNoise = snoise(st * 150.0) * 0.03;
      
      // 混合基底色和墨色
      vec3 finalColor = mix(uBaseColor + paperNoise, uInkColor, inkIntensity * (1.0 - uTransitionProgress));
      
      // 过渡到第二幕：如果 uTransitionProgress > 0，背景逐渐被黑色/透明吞噬或者汇聚，这里简单处理为向透明过渡
      float alpha = 1.0;
      if (uTransitionProgress > 0.0) {
        // 汇聚成方块的特效由具体的粒子实现，这里背景逐渐淡出
        alpha = 1.0 - uTransitionProgress;
      }
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
  transparent: true,
};

function BackgroundPlane({ progress, mouse }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      
      // 平滑移动鼠标
      materialRef.current.uniforms.uMouse.value.lerp(mouse, 0.05);
      materialRef.current.uniforms.uTransitionProgress.value = progress;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        args={[WaterShaderMaterial]}
        depthWrite={false}
      />
    </mesh>
  );
}

// 水滴粒子系统
function WaterParticles({ count = 2000, mouse, progress }) {
  const pointsRef = useRef();
  
  const particlesData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // 初始分布在屏幕范围内
      positions[i * 3] = (Math.random() - 0.5) * 4; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5 + 0.1; // z
      
      randoms[i] = Math.random();
      speeds[i] = 0.01 + Math.random() * 0.02;
    }
    return { positions, randoms, speeds };
  }, [count]);

  const geometryRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const positions = geometryRef.current.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // 粒子基础运动：像是悬浮在水中的浮尘
      const noise = Math.sin(time * particlesData.speeds[i] + particlesData.randoms[i] * Math.PI * 2);
      
      // 鼠标交互排斥
      const px = positions[i3];
      const py = positions[i3 + 1];
      const distToMouse = Math.sqrt(Math.pow(px - mouse.x * 2, 2) + Math.pow(py - mouse.y * 2, 2));
      
      let pushX = 0;
      let pushY = 0;
      if (distToMouse < 0.5) {
        const force = (0.5 - distToMouse) * 0.1;
        pushX = ((px - mouse.x * 2) / distToMouse) * force;
        pushY = ((py - mouse.y * 2) / distToMouse) * force;
      }
      
      // 第二幕过渡：聚集成一个正方体
      if (progress > 0) {
        // 目标位置为一个虚拟正方体内部，同时将它们推向屏幕中心
        const targetX = (particlesData.randoms[i] % 0.5 - 0.25) * 4;
        const targetY = ((particlesData.randoms[i] * 10) % 0.5 - 0.25) * 4;
        const targetZ = ((particlesData.randoms[i] * 100) % 0.5 - 0.25) * 4;
        
        // 当 progress 增加时，粒子不仅趋向方块排列，而且整体缩小/汇聚
        const scale = 1.0 - progress * 0.5;
        
        positions[i3] += (targetX * scale - positions[i3]) * progress * 0.08;
        positions[i3 + 1] += (targetY * scale - positions[i3 + 1]) * progress * 0.08;
        positions[i3 + 2] += (targetZ * scale - positions[i3 + 2]) * progress * 0.08;
      } else {
        // 正常游荡
        positions[i3] += pushX + Math.sin(time * 0.5 + i) * 0.001;
        positions[i3 + 1] += pushY + Math.cos(time * 0.5 + i) * 0.001;
        
        // 边界循环
        if (positions[i3] > 2) positions[i3] = -2;
        if (positions[i3] < -2) positions[i3] = 2;
        if (positions[i3 + 1] > 2) positions[i3 + 1] = -2;
        if (positions[i3 + 1] < -2) positions[i3 + 1] = 2;
      }
    }
    
    geometryRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#a1b5c2" // 粒子颜色，淡青灰
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Act1WaterBackground({ transitionProgress = 0 }) {
  const [mouse, setMouse] = useState(new THREE.Vector2(-1, -1));

  useEffect(() => {
    const handleMouseMove = (e) => {
      // 归一化鼠标坐标: -1 to +1
      setMouse(new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      ));
    };
    
    // 如果有移动设备支持可以加上 touchmove
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ alpha: true, antialias: true }}
      >
        <BackgroundPlane progress={transitionProgress} mouse={mouse} />
        <WaterParticles count={3000} mouse={mouse} progress={transitionProgress} />
      </Canvas>
    </div>
  );
}
