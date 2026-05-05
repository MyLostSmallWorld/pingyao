import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, invalidate } from "@react-three/fiber";
import { Bounds, Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import wallModelUrl from "../../assets/models/pingyao-wall.glb?url";

const WALL_MODEL_URL = wallModelUrl;

const wallMetrics = [
  { value: "6163m", label: "城墙周长" },
  { value: "6座", label: "城门节点" },
  { value: "72座", label: "敌楼序列" },
  { value: "3000个", label: "垛口细部" },
];

const MARKER_MIN = -0.25;
const MARKER_MAX = 1.25;

const defaultWallModelMarkers = [
  { key: "wall", step: "01", label: "城墙周界", x: 0.238, y: 0.399, z: 0.191 },
  { key: "gate", step: "02", label: "六门入口", x: 0.506, y: 0.907, z: 0.888 },
  { key: "urn", step: "03", label: "瓮城折转", x: 0.508, y: 0.135, z: 0.063 },
  { key: "mian", step: "04", label: "马面外凸", x: 0.124, y: 0.648, z: 0.573 },
  { key: "enemy", step: "05", label: "敌楼序列", x: 0.816, y: 0.25, z: 0.672 },
  { key: "crenel", step: "06", label: "垛口细部", x: 0.219, y: 0.411, z: 0.882 },
  { key: "corner", step: "07", label: "转角防守", x: 0.853, y: 0.382, z: 0.196 },
];

const initialWallItems = [
  {
    key: "wall",
    step: "01",
    layer: "周界层",
    name: "城墙",
    count: "1周",
    role: "先用一圈墙体划定古城边界，也建立城内外的空间秩序。",
    desc: "平面近方形而略有曲折，常被视作“龟甲纹”外廓。周长约 6163 米，高约 6 至 10 米，顶宽约 3 至 5 米，是整套防御系统展开的基础。",
  },
  {
    key: "gate",
    step: "02",
    layer: "入口层",
    name: "城门",
    count: "6座",
    role: "城门不是简单开口，而是交通、仪制与防御控制的交汇点。",
    desc: "南北各一、东西各二，均为拱券门洞并上建城楼。南门“迎薰”、北门“拱极”、上东门“太和”等名称各具寓意，共同构成“龟形六门”的识别结构。",
  },
  {
    key: "urn",
    step: "03",
    layer: "缓冲层",
    name: "瓮城",
    count: "4座",
    role: "瓮城把入口变成折转空间，让城门防御多出一道缓冲。",
    desc: "分布在南、北、上东、上西四门之外，多为方形。城门与瓮城门常呈 90 度夹角，可避免直线冲击，是平遥城门防御的重要纵深层。",
  },
  {
    key: "mian",
    step: "04",
    layer: "外凸层",
    name: "马面（垛台）",
    count: "若干",
    role: "马面向墙外伸出，让守城视线与防御面不只停留在一条直线上。",
    desc: "突出于城墙外侧的墩台，用以增加防御面控制。平面有方形、圆形等变化，上部常与敌楼配合，是城墙外凸式火力节点。",
  },
  {
    key: "enemy",
    step: "05",
    layer: "巡防层",
    name: "敌楼",
    count: "72座",
    role: "敌楼把城墙顶部组织成可巡逻、可驻守、可观察的连续防线。",
    desc: "沿城墙顶部连续分布，砖砌小房既供士兵巡逻避风雨，也用于存放器械。传统解释中象征孔子七十二贤人，体现“文武相济”的筑城理念。",
  },
  {
    key: "crenel",
    step: "06",
    layer: "射防层",
    name: "垛口",
    count: "3000个",
    role: "垛口把观察、掩护与射防功能压缩到城墙顶部的细部之中。",
    desc: "位于城墙顶部外侧，多为方形，设瞭望孔与射孔。其数量常被解释为象征孔子三千弟子，是平遥城墙“数字哲学”的代表性细部。",
  },
  {
    key: "corner",
    step: "07",
    layer: "转角层",
    name: "角楼",
    count: "4座",
    role: "角楼处理城墙转折处的观察与驻守，是边界的关键节点。",
    desc: "原设于城墙四角，承担瞭望与驻兵职能。现建筑已不存，仅部分角台基尚可辨认，作为转角防御系统的历史痕迹仍值得被看见。",
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

function clampMarkerValue(value) {
  return Math.min(MARKER_MAX, Math.max(MARKER_MIN, Number(value)));
}

function mergeStoredMarkers(storedMarkers) {
  if (!Array.isArray(storedMarkers)) return defaultWallModelMarkers;
  return defaultWallModelMarkers.map((marker) => {
    const stored = storedMarkers.find((item) => item.key === marker.key);
    if (!stored) return marker;
    return {
      ...marker,
      x: clampMarkerValue(stored.x),
      y: clampMarkerValue(stored.y),
      z: clampMarkerValue(stored.z),
    };
  });
}

function loadMarkerDrafts() {
  return defaultWallModelMarkers;
}

function formatMarkerValue(value) {
  return Number(value).toFixed(3);
}

function getMarkerExportText(markers) {
  return JSON.stringify(
    markers.map(({ key, step, label, x, y, z }) => ({
      key,
      step,
      label,
      x: Number(formatMarkerValue(x)),
      y: Number(formatMarkerValue(y)),
      z: Number(formatMarkerValue(z)),
    })),
    null,
    2,
  );
}

function getMarkerPosition(box, marker) {
  const size = new THREE.Vector3();
  box.getSize(size);
  return [
    box.min.x + size.x * marker.x,
    box.min.y + size.y * marker.y,
    box.min.z + size.z * marker.z,
  ];
}

function getMarkerFromPoint(box, point) {
  const size = new THREE.Vector3();
  box.getSize(size);
  return {
    x: clampMarkerValue((point.x - box.min.x) / size.x),
    y: clampMarkerValue((point.y - box.min.y) / size.y),
    z: clampMarkerValue((point.z - box.min.z) / size.z),
  };
}

function WallModelMarker({
  marker,
  box,
  activeKey,
  calibrationOpen,
  onSelect,
}) {
  const isActive = marker.key === activeKey;
  const position = useMemo(() => getMarkerPosition(box, marker), [box, marker]);

  return (
    <Html position={position} distanceFactor={6} zIndexRange={[20, 0]}>
      <button
        type="button"
        className={
          isActive && calibrationOpen
            ? "wall-system__model-marker is-active is-calibrating"
            : isActive
              ? "wall-system__model-marker is-active"
              : "wall-system__model-marker"
        }
        onClick={(event) => {
          event.stopPropagation();
          onSelect(marker.key);
        }}
      >
        <span className="wall-system__model-marker-dot" aria-hidden="true" />
        <span
          className="wall-system__model-marker-label"
          data-step={marker.step}
        >
          {marker.label}
        </span>
      </button>
    </Html>
  );
}

function useWallScene(url) {
  const gltf = useGLTF(url);
  return useMemo(() => {
    const scene = gltf.scene.clone();
    tuneMaterials(scene);
    scene.updateMatrixWorld(true);
    return {
      scene,
      box: new THREE.Box3().setFromObject(scene),
    };
  }, [gltf.scene]);
}

function WallMesh({
  scene,
  box,
  activeKey,
  calibrationOpen,
  onPickSurface,
}) {
  const pickSurface = (event) => {
    if (!calibrationOpen) return;
    event.stopPropagation();
    onPickSurface(activeKey, getMarkerFromPoint(box, event.point));
  };

  return (
    <group onPointerDown={pickSurface}>
      <primitive object={scene} />
    </group>
  );
}

function WallMarkerLayer({
  box,
  activeKey,
  calibrationOpen,
  markers,
  onSelect,
}) {
  return (
    <group>
      {markers.map((marker) => (
        <WallModelMarker
          key={marker.key}
          marker={marker}
          box={box}
          activeKey={activeKey}
          calibrationOpen={calibrationOpen}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

function WallSceneContent({
  activeKey,
  calibrationOpen,
  markers,
  onPickSurface,
  onSelect,
}) {
  const { scene, box } = useWallScene(WALL_MODEL_URL);
  const controlsRef = useRef();
  const orbitTarget = useMemo(() => {
    const center = new THREE.Vector3();
    box.getCenter(center);
    return center.toArray();
  }, [box]);

  return (
    <>
      <Bounds fit clip margin={1.12}>
        <WallMesh
          scene={scene}
          box={box}
          activeKey={activeKey}
          calibrationOpen={calibrationOpen}
          onPickSurface={onPickSurface}
        />
      </Bounds>
      <WallMarkerLayer
        box={box}
        activeKey={activeKey}
        calibrationOpen={calibrationOpen}
        markers={markers}
        onSelect={onSelect}
      />
      <OrbitControls
        ref={controlsRef}
        target={orbitTarget}
        enabled={!calibrationOpen}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={2.4}
        maxDistance={6.4}
        autoRotate={Boolean(!activeKey && !calibrationOpen)}
        autoRotateSpeed={0.12}
        onChange={() => invalidate()}
      />
    </>
  );
}

function WallCanvasContent({
  activeKey,
  calibrationOpen,
  markers,
  onPickSurface,
  onSelect,
}) {
  useEffect(() => {
    invalidate();
  }, [activeKey, markers]);

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
        <WallSceneContent
          activeKey={activeKey}
          calibrationOpen={calibrationOpen}
          markers={markers}
          onPickSurface={onPickSurface}
          onSelect={onSelect}
        />
      </Suspense>
    </>
  );
}

function onCanvasCreated(state) {
  const { gl } = state;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.12;
  gl.outputColorSpace = THREE.SRGBColorSpace;
}

function WallViewer({
  active,
  activeKey,
  calibrationOpen,
  markers,
  onPickSurface,
  onSelect,
}) {
  const spinning = Boolean(active && !activeKey && !calibrationOpen);

  return (
    <div
      className={
        calibrationOpen
          ? "wall-system__viewer-box is-calibrating"
          : "wall-system__viewer-box"
      }
    >
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
        <WallCanvasContent
          activeKey={activeKey}
          calibrationOpen={calibrationOpen}
          markers={markers}
          onPickSurface={onPickSurface}
          onSelect={onSelect}
        />
      </Canvas>
    </div>
  );
}

function WallSystemSection() {
  const [activeKey, setActiveKey] = useState(initialWallItems[0].key);
  const markers = loadMarkerDrafts();
  const sectionRef = useRef(null);
  const [viewerActive, setViewerActive] = useState(false);
  const activeItem =
    initialWallItems.find((item) => item.key === activeKey) ||
    initialWallItems[0];

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

  useEffect(() => {
    if (viewerActive) {
      useGLTF.preload(WALL_MODEL_URL);
    }
  }, [viewerActive]);

  return (
    <section id="home-wall-system" className="wall-system" ref={sectionRef}>
      <div className="wall-system__viewer-stage">
        {viewerActive ? (
          <WallViewer
            active={viewerActive}
            activeKey={activeKey}
            calibrationOpen={false}
            markers={markers}
            onPickSurface={() => {}}
            onSelect={setActiveKey}
          />
        ) : (
          <div className="wall-system__viewer-box wall-system__viewer-box--placeholder">
            <p>3D 视图将在滚动到此处后自动加载。</p>
          </div>
        )}

        <div className="wall-system__overlay">
          <div className="wall-system__control-panel">
            <div className="wall-system__head">
              <h2>城墙体系</h2>
              <p className="wall-system__intro">
                平遥城墙不是孤立的围墙，而是由周界、入口、缓冲、巡防与射防细部共同组成的防御系统。沿着这套层级观察，可以看见古城如何把交通、守备和象征秩序组织在同一圈城墙之上。
              </p>
              <ul className="wall-system__metrics" aria-label="城墙体系核心数据">
                {wallMetrics.map((metric) => (
                  <li key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <section className="wall-system__focus-panel" aria-live="polite">
              <div className="wall-system__focus-meta">
                <span>{activeItem.layer}</span>
                <strong>{activeItem.count}</strong>
              </div>
              <h3>{activeItem.name}</h3>
              <p className="wall-system__focus-role">{activeItem.role}</p>
              <p className="wall-system__focus-desc">{activeItem.desc}</p>
            </section>

            <div className="wall-system__flow" aria-label="城墙防御流程">
              {initialWallItems.map((item) => {
                const isActive = item.key === activeKey;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={
                      isActive
                        ? "wall-system__flow-step is-active"
                        : "wall-system__flow-step"
                    }
                    aria-pressed={isActive}
                    onClick={() => setActiveKey(item.key)}
                  >
                    <span className="wall-system__flow-index">
                      {item.step}
                    </span>
                    <span className="wall-system__flow-body">
                      <strong>{item.layer}</strong>
                      <span>{item.name}</span>
                    </span>
                    <span className="wall-system__flow-count">
                      {item.count}
                    </span>
                  </button>
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
