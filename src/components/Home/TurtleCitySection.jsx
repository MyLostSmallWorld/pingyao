import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./TurtleCitySection.css";
import beimenGongjiUrl from "../../assets/images/home/beimen-gongji.jpg";
import nanmenYingxunUrl from "../../assets/images/home/nanmen-yingxun.jpg";
import pingyaoMapUrl from "../../assets/images/home/pingyao_map_square_blended_2266.jpg";
import shangdongmenUrl from "../../assets/images/home/shangdongmen.jpg";
import shangximenYongdingUrl from "../../assets/images/home/shangximen-yongding.jpg";
import xiaximenUrl from "../../assets/images/home/xiaximen.jpg";

const faces = [
  { key: "top", name: "龟城总览", src: pingyaoMapUrl },
  { key: "front", name: "南门·迎薰门", src: nanmenYingxunUrl },
  { key: "right", name: "左足·太和门", src: shangdongmenUrl },
  { key: "back", name: "右足·永定门", src: shangximenYongdingUrl },
  { key: "left", name: "北门·拱极门", src: beimenGongjiUrl },
  { key: "bottom", name: "下西门（占位）", src: xiaximenUrl },
];

/** 与参考 STOPS 一致 */
const stops = [
  { rx: 90, ry: 0 },
  { rx: 0, ry: 0 },
  { rx: 0, ry: -90 },
  { rx: 0, ry: -180 },
  { rx: 0, ry: -270 },
  { rx: -90, ry: -360 },
];

const scenes = [
  {
    id: "s0",
    tag: "龟城形制 · 序章",
    title: "一城如龟，六门为骨。",
    name: "总览",
    text: "南门为首，北门为尾，东西四门为足。平遥的城市形制，把防御、礼制与民间象征叠合在同一座城里。",
    detail:
      "清光绪八年《平遥县志》记载：“形如龟，南门为龟首，北门为龟尾，东西四门为四足。”这不是单纯的形象比附，而是城市工程、礼制秩序与地方想象共同作用的结果。",
  },
  {
    id: "s1",
    tag: "龟首 · 南门",
    title: "从迎薰门进入平遥。",
    name: "龟首",
    text: "南门是龟首，也是古城叙事的第一入口。由此向内，街巷、城墙与礼制空间依次展开。",
    detail:
      "平遥城墙可追溯至周宣王时期，明洪武三年完成系统重修。南门“龟首”不仅承担礼仪与交通功能，也成为古城形象最鲜明的识别面。",
  },
  {
    id: "s2",
    tag: "东足 · 太和门",
    title: "四足撑起城池秩序。",
    name: "东足",
    text: "东侧城门连接交通、防御与民间象征，像龟足一样稳定城市的横向结构。",
    detail:
      "东西四门对应灵龟四足，既是交通节点，也是防御转换的位置。地方风水叙事又为它们赋予了“留吉”“稳固”的象征含义。",
  },
  {
    id: "s3",
    tag: "西足 · 永定门",
    title: "东西相对，城势成形。",
    name: "西足",
    text: "西侧城门与东足相对，共同构成古城横向交通与防线转换的支点。",
    detail:
      "“西足”不是单独的命名，而是与城门分布、街巷组织、防御节点一起，组成“龟城”结构的可识别部分。",
  },
  {
    id: "s4",
    tag: "龟尾",
    title: "北门为尾，水势出城。",
    name: "龟尾",
    text: "北门地势最低，承担排水外泄。龟尾之名，让城市工程与空间象征在这里相遇。",
    detail:
      "“形如龟”并非纯视觉比附。它与排水系统、地势组织和城市工程逻辑紧密相连，也解释了古城为何形成“南高北低”的空间格局。",
  },
  {
    id: "s5",
    tag: "下一幕 · 城墙体系",
    title: "由门入墙，继续读城。",
    name: "城墙体系",
    text: "识别龟城形制之后，视线转向城墙、城门、瓮城、敌楼与垛口组成的防御系统。",
    detail:
      "平遥古城以“城墙周界 + 六门节点 + 瓮城缓冲 + 敌楼垛口”的层级结构，形成兼具军事功能与城市秩序的完整体系。",
  },
];

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function TurtleCitySection() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [expanded, setExpanded] = useState("s0");

  const updateProgress = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const docTop = rect.top + window.scrollY;
    const height = el.offsetHeight;
    const distance = Math.max(height - vh, 1);
    const value = (window.scrollY - docTop) / distance;
    setProgress(clamp(value, 0, 1));
  }, []);

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    setInView(r.bottom > 0 && r.top < vh);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e) setInView(e.isIntersecting);
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  const faceCount = scenes.length;
  const activeIndex = Math.min(faceCount - 1, Math.floor(progress * faceCount));
  const segment = progress * (faceCount - 1);
  const segIndex = Math.min(Math.floor(segment), faceCount - 2);
  const segProgress = easeInOut(segment - segIndex);
  const from = stops[segIndex];
  const to = stops[segIndex + 1];
  const rx = from.rx + (to.rx - from.rx) * segProgress;
  const ry = from.ry + (to.ry - from.ry) * segProgress;

  const cubeStyle = useMemo(
    () => ({ transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }),
    [rx, ry],
  );
  const activeScene = scenes[activeIndex];
  const pct = Math.round(progress * 100);

  const goScene = (index) => {
    const target = cardRefs.current[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const rootClass = [
    "turtle-sector",
    isDark ? "is-dark" : "is-light",
    inView ? "is-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      id="home-turtle-city"
      className={rootClass}
      ref={sectionRef}
      aria-label="龟城形制滚动板块"
    >
      {/* 参考 #scene：fixed + flex + perspective；z-index 低于滚动层 */}
      <div
        className="turtle-sector__scene"
        id="turtle-scene"
        aria-hidden={!inView}
      >
        <div id="turtle-cube" className="turtle-sector__cube" style={cubeStyle}>
          {faces.map((face, idx) => (
            <div
              key={face.key}
              className={`turtle-sector__face turtle-sector__face--${face.key}`}
              data-face={face.key}
              data-active={idx === activeIndex ? "true" : "false"}
              style={{ backgroundImage: `url(${face.src})` }}
            >
              <span className="turtle-sector__face-label">{face.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 参考 #hud */}
      <div className="turtle-sector__hud" aria-hidden={!inView}>
        <div className="turtle-sector__hud-pct">{String(pct).padStart(3, "0")}%</div>
        <div className="turtle-sector__progress-bar">
          <div className="turtle-sector__progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="turtle-sector__scene-label">{activeScene.name}</div>
      </div>


      {/* 参考 #scene_strip */}
      <div className="turtle-sector__strip" aria-hidden={!inView}>
        {scenes.map((scene, idx) => (
          <button
            key={scene.id}
            type="button"
            className={idx === activeIndex ? "turtle-sector__dot is-active" : "turtle-sector__dot"}
            onClick={() => goScene(idx)}
            aria-label={`跳转到${scene.name}`}
          />
        ))}
      </div>

      {/* 参考 #face_caption */}
      <div className="turtle-sector__face-caption" aria-hidden={!inView}>
        <div className="turtle-sector__face-caption-num">{String(activeIndex + 1).padStart(2, "0")}</div>
        <div className="turtle-sector__face-caption-name">{activeScene.name}</div>
      </div>

      {/* 参考 #scroll_container：在立方体之上，中间留空透出 fixed scene */}
      <div className="turtle-sector__scroll" id="turtle-scroll-container">
        {scenes.map((scene, idx) => (
          <article
            key={scene.id}
            id={scene.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className={idx % 2 === 1 ? "turtle-sector__panel-shell is-right" : "turtle-sector__panel-shell"}
          >
            <div className="turtle-sector__panel">
              <p className="turtle-sector__tag">{scene.tag}</p>
              <h2>{scene.title}</h2>
              <p className="turtle-sector__body">{scene.text}</p>
              <button
                type="button"
                className="turtle-sector__cta"
                onClick={() => setExpanded((current) => (current === scene.id ? "" : scene.id))}
              >
                {expanded === scene.id ? "收起线索" : "展开线索"}
              </button>
              {expanded === scene.id ? <p className="turtle-sector__detail">{scene.detail}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TurtleCitySection;
