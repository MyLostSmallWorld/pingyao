import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./TurtleCitySection.css";

const faces = [
  { key: "top", name: "龟城总览", src: "/src/assets/images/home/pingyao_map_square_blended_2266.jpg" },
  { key: "front", name: "南门·迎薰门", src: "/src/assets/images/home/nanmen-yingxun.jpg" },
  { key: "right", name: "左足·太和门", src: "/src/assets/images/home/shangdongmen.jpg" },
  { key: "back", name: "右足·永定门", src: "/src/assets/images/home/shangximen-yongding.jpg" },
  { key: "left", name: "北门·拱极门", src: "/src/assets/images/home/beimen-gongji.jpg" },
  { key: "bottom", name: "下西门（占位）", src: "/src/assets/images/home/xiaximen.jpg" },
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
    tag: "龟城形制 · 开场",
    title: "一城如龟，城门即骨。",
    name: "总览",
    text: "史料原文（清光绪八年《平遥县志》）明确记载：“形如龟，南门为龟首，北门为龟尾，东西四门为四足”，平遥城池由此形成鲜明的“龟城”格局。",
    detail:
      "现代汉语可理解为：平遥城墙肇基于周宣王时期，明洪武三年完成系统重修，城周约 6.4 公里、城高约 10 米，六门分布与护城河体系共同构成坚固防御。志书所说“取其固也”，正是古城工程理性与晋商稳健精神的共同表达。",
  },
  {
    id: "s1",
    tag: "龟首",
    title: "南门为首，双井为睛。",
    name: "龟首",
    text: "平遥城墙可追溯至周宣王时尹吉甫驻兵筑城，至明洪武三年完成系统重修，古今城形一脉相承。",
    detail:
      "从“周时肇基”到“明代定型”，平遥并非一次性建成，而是在长期边防、商贸与民居实践中持续演化。南门“龟首”不仅承担礼仪与交通功能，也在空间叙事上成为古城形象的第一识别面。",
  },
  {
    id: "s2",
    tag: "龟足（东）",
    title: "东西四门，分作四足。",
    name: "东足",
    text: "东西四座城门对应灵龟四足，构成攻防转换与城市交通的关键节点。",
    detail:
      "风水叙事中，下东门朝向特殊，被赋予“拴足留吉”的象征解释，体现古城礼制与民间信仰的融合。",
  },
  {
    id: "s3",
    tag: "龟足（西）",
    title: "上西门定位西足。",
    name: "西足",
    text: "与东足相对，上西门（永定门）共同完成“东西四门为四足”的龟城结构识别。",
    detail:
      "西足并非附会命名，而是与城门分布、街巷组织和防御节点一起，构成古城横向交通与防线转换的重要支点。",
  },
  {
    id: "s4",
    tag: "龟尾",
    title: "北门为尾，导水出城。",
    name: "龟尾",
    text: "北门（拱极门）地势最低，承担全城排水外泄，是“南高北低”城市格局的功能落点。",
    detail:
      "“形如龟”并非纯视觉比附，而是与排水系统、地势组织和城市工程逻辑紧密耦合。",
  },
  {
    id: "s5",
    tag: "下一幕 · 城墙体系",
    title: "由门入墙，进入防御系统。",
    name: "城墙体系",
    text: "完成“龟首—龟足—龟尾”的空间识别后，下一幕将转入城墙体系：城墙、城门、瓮城、角楼、敌楼与垛口的整体防御逻辑。",
    detail:
      "你将看到平遥古城如何以“城墙周界 + 六门节点 + 瓮城缓冲 + 敌楼垛口”的层级结构，形成兼具军事功能与城市秩序的完整体系。",
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

      <button
        type="button"
        className="turtle-sector__theme"
        onClick={() => setIsDark((v) => !v)}
        aria-label="切换明暗主题"
        aria-hidden={!inView}
      >
        {isDark ? "浅色" : "深色"}
      </button>

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
                {expanded === scene.id ? "收起详细介绍" : "点击查看详细介绍"}
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
