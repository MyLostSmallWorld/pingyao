import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, invalidate } from "@react-three/fiber";
import { Bounds, Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const WALL_MODEL_URL = "/src/assets/models/pingyao-wall-v2.glb";

const initialWallItems = [
  {
    key: "wall",
    name: "城墙",
    count: "1周",
    desc: "平面近方形而略有曲折，常被视作“龟甲纹”外廓。周长约 6163 米，高约 6 至 10 米，顶宽约 3 至 5 米，是古城防御与空间秩序的共同边界。",
  },
  {
    key: "gate",
    name: "城门",
    count: "6座",
    desc: "南北各一、东西各二，均为拱券门洞并上建城楼。南门“迎薰”、北门“拱极”、上东门“太和”等名称各具寓意，同时共同构成“龟形六门”的识别结构。",
  },
  {
    key: "urn",
    name: "瓮城",
    count: "4座",
    desc: "分布在南、北、上东、上西四门之外，多为方形。城门与瓮城门常呈 90 度夹角，以避免敌军直冲，是平遥城门防御的重要纵深层。",
  },
  {
    key: "corner",
    name: "角楼",
    count: "4座",
    desc: "原设于城墙四角，承担瞭望与驻兵职能。现建筑已不存，仅部分角台基尚可辨认，是城墙转角防御系统的重要节点。",
  },
  {
    key: "mian",
    name: "马面（垛台）",
    count: "若干",
    desc: "突出于城墙外侧的墩台，用以增加防御面控制。平面有方形、圆形等变化，上部常与敌楼配合，是城墙外凸式火力节点。",
  },
  {
    key: "enemy",
    name: "敌楼",
    count: "72座",
    desc: "沿城墙顶部连续分布，砖砌小房既供士兵巡逻避风雨，也用于存放器械。传统解释中象征孔子七十二贤人，体现“文武相济”的筑城理念。",
  },
  {
    key: "crenel",
    name: "垛口",
    count: "3000个",
    desc: "位于城墙顶部外侧，多为方形，设瞭望孔与射孔。其数量常被解释为象征孔子三千弟子，是平遥城墙“数字哲学”的代表性细部。",
  },
];

function ModelFallback() {
  return (
    <Html center>
      <div className="wall-system__loading">模型加载中...</div>
    </Html>
  );
}

/** 提亮观感：保留材质层次，避免过曝 */
function tuneMaterials(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => {
      if (!mat || !mat.isMaterial) return;
      if (mat.map) {
        mat.map.colorSpace = THREE.SRGBColorSpace;
      }
      if (mat.color) {
        const { r, g, b } = mat.color;
        if (r > 0.92 && g > 0.92 && b > 0.92) {
          mat.color.setHex(0xffffff);
        }
      }
      if (typeof mat.metalness === "number") {
        mat.metalness = Math.min(mat.metalness, 0.32);
      }
      if (typeof mat.roughness === "number") {
        mat.roughness = Math.max(mat.roughness, 0.54);
      }
      mat.needsUpdate = true;
    });
  });
}

function WallModel({ url }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const s = gltf.scene.clone();
    tuneMaterials(s);
    return s;
  }, [gltf.scene]);

  return <primitive object={scene} />;
}

useGLTF.preload(WALL_MODEL_URL);

function WallCanvasContent({ activeKey }) {
  const controlsRef = useRef();

  useEffect(() => {
    invalidate();
  }, [activeKey]);

  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      {/* 纯白方案：白环境光 + 白主光 */}
      <ambientLight intensity={0.56} color="#ffffff" />
      <hemisphereLight color="#ffffff" groundColor="#c9d3dc" intensity={0.74} />
      <directionalLight
        position={[5.2, 8, 4.2]}
        intensity={1.2}
        color="#ffffff"
        castShadow={false}
      />
      <directionalLight
        position={[-3.5, 2.8, -2.2]}
        intensity={0.38}
        color="#dbe4ea"
      />

      <Suspense fallback={<ModelFallback />}>
        <Bounds fit clip margin={1.12}>
          <WallModel url={WALL_MODEL_URL} />
        </Bounds>
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={2.4}
        maxDistance={6.4}
        autoRotate={Boolean(!activeKey)}
        autoRotateSpeed={0.12}
        onChange={() => invalidate()}
      />
    </>
  );
}

function onCanvasCreated(state) {
  const { gl } = state;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.12;
  gl.outputColorSpace = THREE.SRGBColorSpace;
}

function WallViewer({ active, activeKey }) {
  const spinning = Boolean(active && !activeKey);

  return (
    <div className="wall-system__viewer-box">
      <Canvas
        dpr={[1, 1]}
        frameloop={spinning ? "always" : "demand"}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 1.45, 3.9], fov: 40, near: 0.1, far: 80 }}
        onCreated={onCanvasCreated}
      >
        <WallCanvasContent activeKey={activeKey} />
      </Canvas>
    </div>
  );
}

function WallSystemSection() {
  const [activeKey, setActiveKey] = useState(initialWallItems[0].key);
  const sectionRef = useRef(null);
  const [viewerActive, setViewerActive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setViewerActive(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: "120px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="home-wall-system" className="wall-system" ref={sectionRef}>
      <div className="wall-system__viewer-stage">
        {viewerActive ? (
          <WallViewer active={viewerActive} activeKey={activeKey} />
        ) : (
          <div className="wall-system__viewer-box wall-system__viewer-box--placeholder">
            <p>3D 视图将在滚动到此处后自动加载。</p>
          </div>
        )}

        <div className="wall-system__overlay">
          <div className="wall-system__head">
            <div>
              <h2>城墙体系</h2>
              <p className="wall-system__intro">
                依据当前整理的城墙核心数据，对平遥古城城墙、城门、瓮城、角楼、敌楼、垛口与马面进行要点化展示。
              </p>
            </div>
          </div>

          <div className="wall-system__layout">
            <div className="wall-system__list">
              {initialWallItems.map((item) => {
                const isActive = item.key === activeKey;
                return (
                  <article
                    key={item.key}
                    className={
                      isActive
                        ? "wall-system__item is-active"
                        : "wall-system__item"
                    }
                  >
                    <button
                      type="button"
                      className="wall-system__item-trigger"
                      onClick={() => setActiveKey(isActive ? "" : item.key)}
                    >
                      <div className="wall-system__item-main">
                        <span className="wall-system__item-name">
                          {item.name}
                        </span>
                        <span className="wall-system__item-count">
                          数量：{item.count}
                        </span>
                      </div>
                      <span
                        className="wall-system__item-arrow"
                        aria-hidden="true"
                      >
                        {isActive ? "−" : "+"}
                      </span>
                    </button>
                    {isActive ? (
                      <p className="wall-system__item-desc">{item.desc}</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WallSystemSection;
