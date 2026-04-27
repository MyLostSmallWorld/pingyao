import { useEffect, useRef, useState, useCallback } from "react";
import "./Timeline.css";

/* ══════════════════════════════════════════
   历史数据
══════════════════════════════════════════ */
const TIMELINE_ITEMS = [
  {
    text: "西周筑城",
    bg: "/src/assets/images/route/history/xizhou/2.jpg",
    image: "/src/assets/images/route/history/xizhou/1.jpg",
    imageAlt: "西周筑城",
    imageLabel: "西周城池复原图",
    year: "公元前827年",
    description: [
      '历史背景：周宣王时期，平遥地区属古冀州，为西周分封的诸侯国领地。据《平遥县志》记载，此地最早称为"平陶"，因陶土资源丰富而得名。',
      "关键事件：西周时期开始筑建城池，形成了平遥古城的最初雏形。当时的城池规模较小，主要为军事防御功能。",
      "历史影响：奠定了平遥古城的基础格局，确立了城市选址和最初的城市形态。这一时期的筑城活动为后来的城市发展奠定了基础。",
    ],
    meta: ["时代特征：青铜时代", "城市功能：军事防御"],
  },
  {
    text: "秦置平陶县",
    bg: "/src/assets/images/route/history/qin/2.png",
    image: "/src/assets/images/route/history/qin/1.png",
    imageAlt: "秦代平陶",
    imageLabel: "秦代行政区划图",
    year: "公元前221年",
    description: [
      "历史背景：秦始皇统一六国后，实行郡县制，建立了中央集权的封建制度。",
      "关键事件：在平遥地区设置平陶县，属太原郡管辖。这是平遥作为行政区划的开始，标志着平遥正式纳入中央集权的治理体系。",
      "历史影响：确立了平遥的行政地位，促进了地方经济和文化的发展。郡县制的推行使平遥成为中原王朝治理体系的重要组成部分。",
    ],
    meta: ["时代特征：郡县制", "行政等级：县级"],
  },
  {
    text: "北魏改名平遥",
    bg: "/src/assets/images/route/history/beiwai/2.jpg",
    image: "/src/assets/images/route/history/beiwai/1.jpg",
    imageAlt: "北魏平遥",
    imageLabel: "北魏时期建筑",
    year: "公元424年",
    description: [
      "历史背景：北魏太武帝拓跋焘时期，鲜卑族政权统一北方，推行汉化政策。",
      "关键事件：为避太武帝拓跋焘名讳，平陶县改名为平遥县，这一名称沿用至今。北魏时期，平遥的城市建设得到进一步发展。",
      '历史影响：确定了"平遥"这一名称，成为城市历史的重要标志。北魏时期的城市建设为后来的发展奠定了基础。',
    ],
    meta: ["时代特征：民族融合", "城市发展：稳步增长"],
  },
  {
    text: "明洪武扩城",
    bg: "/src/assets/images/route/history/ming/1.png",
    image: "/src/assets/images/route/history/ming/1.png",
    imageAlt: "明洪武扩城",
    imageLabel: "明代城墙图",
    year: "1370年",
    description: [
      "历史背景：明朝建立后，为防御北方游牧民族入侵，在北方边境地区大规模筑城。",
      '关键事件：明洪武三年，平遥开始大规模筑建城墙。城墙周长6.4公里，高12米，设垛口3000个，敌楼72座，形成了完整的军事防御体系。城池布局遵循"龟城"设计理念，象征长寿吉祥。',
      "历史影响：形成了平遥古城的基本格局，城墙、街巷、建筑体系趋于完善，为后来的商业发展奠定了基础。龟城设计成为平遥古城的重要特色。",
    ],
    meta: ["时代特征：军事防御", "城市格局：龟城设计"],
  },
  {
    text: "票号兴起",
    bg: "/src/assets/images/route/history/piaohao-rise/2.png",
    image: "/src/assets/images/route/history/piaohao-rise/1.png",
    imageAlt: "票号兴起",
    imageLabel: "日升昌票号",
    year: "1823年",
    description: [
      "历史背景：清代中叶，晋商崛起，商业活动日益频繁，货币流通需求增加。",
      "关键事件：雷履泰创办日升昌票号，开创了中国汇兑业务的先河。日升昌票号的成功，带动了平遥票号业的蓬勃发展。",
      "历史影响：晋商文化达到鼎盛，平遥成为中国近代金融业的发源地，城市商业功能得到极大提升。票号的出现标志着中国金融业进入了一个新的发展阶段。",
    ],
    meta: ["时代特征：商业繁荣", "金融创新：汇兑业务"],
  },
  {
    text: "票号鼎盛",
    bg: "/src/assets/images/route/history/piaohao-peak/2.png",
    image: "/src/assets/images/route/history/piaohao-peak/1.png",
    imageAlt: "票号鼎盛",
    imageLabel: "票号鼎盛时期",
    year: "19世纪中后期",
    description: [
      "历史背景：鸦片战争后，中国社会发生重大变革，商业活动更加活跃。",
      "关键事件：平遥票号业进入鼎盛时期，先后涌现出百川通、协同庆、蔚泰厚等20多家票号，形成了庞大的金融网络，业务遍及全国甚至海外。",
      '历史影响：平遥成为"中国的华尔街"，城市建筑、商业文化、社会生活达到空前繁荣。票号的发展推动了中国近代金融业的进步。',
    ],
    meta: ["时代特征：金融中心", "票号数量：20多家"],
  },
  {
    text: "民国衰落",
    bg: "/src/assets/images/route/history/minguo/4.png",
    image: "/src/assets/images/route/history/minguo/2.png",
    imageAlt: "民国衰落",
    imageLabel: "民国时期平遥",
    year: "20世纪初",
    description: [
      "历史背景：辛亥革命后，中国进入民国时期，社会动荡不安，现代银行开始兴起。",
      "关键事件：随着现代银行的兴起和社会动荡，平遥票号业逐渐衰落。民国时期，平遥的商业地位下降，城市发展陷入停滞。",
      "历史影响：平遥从金融中心转变为普通县城，但也因此保留了大量历史建筑和文化遗产。这一时期的相对停滞为后来的文化遗产保护创造了条件。",
    ],
    meta: ["时代特征：社会变革", "城市状态：相对停滞"],
  },
  {
    text: "历史文化名城",
    bg: "/src/assets/images/route/history/1986/2.png",
    image: "/src/assets/images/route/history/1986/1.png",
    imageAlt: "历史文化名城",
    imageLabel: "历史文化名城",
    year: "1986年",
    description: [
      "历史背景：改革开放后，中国开始重视历史文化遗产的保护。",
      "关键事件：平遥被国务院公布为第二批国家历史文化名城，标志着平遥的历史价值得到国家认可，开始进入有计划的保护阶段。",
      "历史影响：开启了平遥古城保护的新篇章，为后续的世界遗产申报奠定了基础。历史文化名城的称号使平遥得到了更多的关注和保护资源。",
    ],
    meta: ["时代特征：文化保护", "保护级别：国家级"],
  },
  {
    text: "世界文化遗产",
    bg: "/src/assets/images/route/history/1997/2.png",
    image: "/src/assets/images/route/history/1997/1.png",
    imageAlt: "世界文化遗产",
    imageLabel: "世界文化遗产证书",
    year: "1997年",
    description: [
      "历史背景：中国积极参与世界文化遗产保护，推动优秀文化遗产走向世界。",
      "关键事件：平遥古城被联合国教科文组织列入世界文化遗产名录，成为中国首批世界文化遗产。",
      "历史影响：平遥古城的保护进入国际化视野，成为中国历史文化保护的典范。世界遗产的称号为平遥带来了国际知名度和旅游发展机遇。",
    ],
    meta: ["时代特征：国际化", "保护级别：世界级"],
  },
  {
    text: "保护修复",
    bg: "/src/assets/images/route/history/modern/5.png",
    image: "/src/assets/images/route/history/modern/1.png",
    imageAlt: "保护修复",
    imageLabel: "现代保护修复",
    year: "21世纪初",
    description: [
      "历史背景：进入21世纪，中国的文化遗产保护意识不断增强，旅游产业蓬勃发展。",
      "关键事件：平遥开始大规模的古城保护和修复工程，包括城墙修复、古建筑保护、历史街区整治等。同时，旅游业蓬勃发展，平遥成为中国著名的历史文化旅游目的地。",
      "历史影响：古城得到全面保护和合理利用，实现了文化遗产保护与旅游发展的良性互动。平遥成为文化遗产保护的成功范例。",
    ],
    meta: ["时代特征：可持续发展", "发展模式：保护与利用"],
  },
];

/* ══════════════════════════════════════════
   逐字打印 Hook
══════════════════════════════════════════ */
function useTypewriter(text, speed = 28, delay = 0) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(id);
      }, speed);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [text, speed, delay]);
  return displayed;
}

/* ══════════════════════════════════════════
   粒子系统（canvas overlay）
══════════════════════════════════════════ */
function ParticleCanvas({ active }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const spawnParticle = (x, y) => {
      for (let k = 0; k < 3; k++) {
        particles.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5 - 1,
          life: 1,
          decay: 0.018 + Math.random() * 0.018,
          size: 2 + Math.random() * 4,
          hue: 38 + Math.random() * 20,
        });
      }
    };

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      spawnParticle(e.clientX, e.clientY);
    };
    const onTouch = (e) => {
      const t = e.touches[0];
      mouseRef.current = { x: t.clientX, y: t.clientY };
      spawnParticle(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.life > 0);
      for (const p of particles.current) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.04;
        p.life -= p.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life) * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 80%, 65%)`;
        ctx.shadowColor = `hsl(${p.hue}, 90%, 55%)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="immersive-particle-canvas" />;
}

/* ══════════════════════════════════════════
   光晕跟随光标
══════════════════════════════════════════ */
function CursorGlow({ active }) {
  const glowRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const el = glowRef.current;
    if (!el) return;

    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      cur.current.x = lerp(cur.current.x, pos.current.x, 0.12);
      cur.current.y = lerp(cur.current.y, pos.current.y, 0.12);
      el.style.left = cur.current.x + "px";
      el.style.top = cur.current.y + "px";
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;
  return <div ref={glowRef} className="immersive-cursor-glow" />;
}

/* ══════════════════════════════════════════
   圆弧进度指示器
══════════════════════════════════════════ */
function ArcProgress({ percent }) {
  const R = 28, cx = 34, cy = 34, stroke = 3;
  const circumference = 2 * Math.PI * R;
  const offset = circumference * (1 - percent);
  return (
    <svg className="immersive-arc-progress" width="68" height="68" viewBox="0 0 68 68">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(200,160,40,0.15)" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cy} r={R} fill="none"
        stroke="url(#arcGold)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.1s linear" }}
      />
      <defs>
        <linearGradient id="arcGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5d070" />
          <stop offset="100%" stopColor="#c8820a" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="#d4a840" fontFamily="XuanZongTi,serif">
        {Math.round(percent * 100)}%
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════
   底部历史轨道导航
══════════════════════════════════════════ */
function TimelineTrack({ items, currentIndex, onSelect }) {
  return (
    <div className="immersive-track">
      <div className="immersive-track__line" />
      {items.map((item, i) => (
        <button
          key={item.text}
          className={`immersive-track__node${i === currentIndex ? " active" : ""}${i < currentIndex ? " passed" : ""}`}
          onClick={() => onSelect(i)}
          title={item.text}
        >
          <span className="immersive-track__dot" />
          <span className="immersive-track__label">{item.text}</span>
          <span className="immersive-track__year">{item.year}</span>
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   沉浸模式 — 单个历史节点
══════════════════════════════════════════ */
function ImmersiveItem({ item, isFirst, onNext, onPrev, isLast, index, total }) {
  const [phase, setPhase] = useState("blur");
  const [revealPct, setRevealPct] = useState(0);
  const canvasRef = useRef(null);
  const blurCanvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const isDrawing = useRef(false);
  const doneRef = useRef(false);
  const soundPlayedRef = useRef(false);
  const mouseXY = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const BRUSH_RADIUS = 80;
  const REVEAL_THRESHOLD = 0.48;
  const SOUND_THRESHOLD = 0.5;

  // 视差跟随状态
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const parallaxRaf = useRef(null);
  const targetParallax = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPhase("blur");
    setRevealPct(0);
    doneRef.current = false;
    soundPlayedRef.current = false;
  }, [item]);

  // 视差动画（detail 阶段）
  useEffect(() => {
    if (phase !== "detail") return;
    const onMove = (e) => {
      const rx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ry = (e.clientY / window.innerHeight - 0.5) * 2;
      targetParallax.current = { x: rx * 18, y: ry * 10 };
    };
    window.addEventListener("mousemove", onMove);
    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      setParallax((prev) => ({
        x: lerp(prev.x, targetParallax.current.x, 0.06),
        y: lerp(prev.y, targetParallax.current.y, 0.06),
      }));
      parallaxRaf.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(parallaxRaf.current); };
  }, [phase]);

  // canvas 初始化
  useEffect(() => {
    if (phase !== "blur") return;
    const canvas = canvasRef.current;
    const blurCanvas = blurCanvasRef.current;
    if (!canvas || !blurCanvas) return;
    const ctx = canvas.getContext("2d");
    const blurCtx = blurCanvas.getContext("2d");
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    blurCanvas.width = W; blurCanvas.height = H;
    const img = new Image();
    img.src = item.bg;
    img.onload = () => {
      const scale = Math.max(W / img.width, H / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      blurCtx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
      ctx.fillStyle = "rgba(12,20,28,0.92)";
      ctx.fillRect(0, 0, W, H);
    };
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [phase, item]);

  const reveal = useCallback((x, y) => {
    if (doneRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    mouseXY.current = { x, y };
    const ctx = canvas.getContext("2d");

    // 主笔刷
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, 0, x, y, BRUSH_RADIUS);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.45, "rgba(0,0,0,0.9)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // 光晕扩散圈
    const g2 = ctx.createRadialGradient(x, y, BRUSH_RADIUS * 0.8, x, y, BRUSH_RADIUS * 1.6);
    g2.addColorStop(0, "rgba(0,0,0,0.35)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.fillStyle = g2;
    ctx.arc(x, y, BRUSH_RADIUS * 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      const W = canvas.width, H = canvas.height;
      // 采样 1/16 像素加速统计
      const data = ctx.getImageData(0, 0, W, H).data;
      let t = 0, total = 0;
      for (let i = 3; i < data.length; i += 64) { if (data[i] < 128) t++; total++; }
      const pct = t / total;
      setRevealPct(pct);
      if (pct >= SOUND_THRESHOLD && !soundPlayedRef.current) {
        soundPlayedRef.current = true;
        const a = new Audio("/src/assets/audio/scene_change.wav");
        a.volume = 0.6;
        a.play().catch(() => {});
      }
      if (pct >= REVEAL_THRESHOLD) {
        doneRef.current = true;
        canvas.style.transition = "opacity 0.7s ease";
        canvas.style.opacity = "0";
        blurCanvasRef.current.style.transition = "opacity 0.7s ease";
        blurCanvasRef.current.style.opacity = "0";
        setTimeout(() => setPhase("detail"), 750);
      }
    });
  }, []);

  const onMouseMove = useCallback((e) => { if (isDrawing.current) reveal(e.clientX, e.clientY); }, [reveal]);
  const onTouchMove = useCallback((e) => { e.preventDefault(); reveal(e.touches[0].clientX, e.touches[0].clientY); }, [reveal]);

  // 逐字打印
  const titleTyped = useTypewriter(phase === "detail" ? item.text : "", 80, 200);
  const yearTyped  = useTypewriter(phase === "detail" ? item.year : "", 50, 0);

  return (
    <div className="immersive-item">
      {/* 粒子层 */}
      <ParticleCanvas active={phase === "blur"} />
      {/* 光晕跟随（blur 阶段） */}
      <CursorGlow active={phase === "blur"} />

      {/* ── 模糊擦除阶段 ── */}
      {phase === "blur" && (
        <div className="immersive-item__blur-stage">
          <canvas ref={blurCanvasRef} className="immersive-item__blur-canvas" />
          <canvas
            ref={canvasRef}
            className="immersive-item__mask-canvas"
            onMouseDown={() => { isDrawing.current = true; }}
            onMouseUp={() => { isDrawing.current = false; }}
            onMouseLeave={() => { isDrawing.current = false; }}
            onMouseMove={onMouseMove}
            onTouchStart={(e) => { e.preventDefault(); reveal(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchMove={onTouchMove}
          />

          {/* 中央标题 */}
          <div className="immersive-item__blur-title">
            <span className="immersive-item__blur-index">{String(index + 1).padStart(2, "0")} · {String(total).padStart(2, "0")}</span>
            <span className="immersive-item__blur-name">{item.text}</span>
            <span className="immersive-item__blur-year">{item.year}</span>
            {/* 装饰线 */}
            <span className="immersive-item__blur-deco" />
          </div>

          {/* 进度弧（右下角） */}
          <div className="immersive-item__arc-wrap">
            <ArcProgress percent={revealPct} />
            <span className="immersive-item__arc-label">擦除解锁</span>
          </div>

          <div className="immersive-item__blur-hint">
            <span className="immersive-item__hint-icon">✦</span>
            按住鼠标擦除，探寻历史
            <span className="immersive-item__hint-icon">✦</span>
          </div>
        </div>
      )}

      {/* ── 详情展示阶段 ── */}
      {phase === "detail" && (
        <div className="immersive-item__detail-stage">
          {/* 视差背景 */}
          <div
            className="immersive-item__detail-bg"
            style={{
              backgroundImage: `url(${item.bg})`,
              transform: `scale(1.08) translate(${parallax.x * -0.5}px, ${parallax.y * -0.5}px)`,
            }}
          />
          {/* 渐变遮罩 */}
          <div className="immersive-item__detail-overlay" />

          {/* 右侧装饰图（视差） */}
          <div
            className="immersive-item__detail-img-frame"
            style={{ transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.4 - 50}px)` }}
          >
            <img src={item.image} alt={item.imageAlt} className="immersive-item__detail-img-thumb" />
            <span className="immersive-item__detail-img-label">{item.imageLabel}</span>
            <span className="immersive-item__detail-img-corner" />
          </div>

          {/* 内容卡片（视差） */}
          <div
            className="immersive-item__detail-card"
            style={{ transform: `translate(${parallax.x * -0.2}px, ${parallax.y * -0.1}px)` }}
          >
            <div className="immersive-item__detail-header">
              <span className="immersive-item__detail-badge">历史脉络</span>
              <span className="immersive-item__detail-year">{yearTyped}<span className="immersive-item__cursor">|</span></span>
              <h2 className="immersive-item__detail-title">{titleTyped}<span className="immersive-item__cursor">|</span></h2>
              <div className="immersive-item__detail-divider" />
            </div>

            <div className="immersive-item__detail-body">
              {item.description.map((para, pi) => {
                const sep = para.indexOf("：");
                return (
                  <p key={para} className="immersive-item__detail-para" style={{ animationDelay: `${0.5 + pi * 0.18}s` }}>
                    {sep === -1 ? para : (
                      <>
                        <strong className="immersive-item__detail-label">{para.slice(0, sep + 1)}</strong>
                        {para.slice(sep + 1)}
                      </>
                    )}
                  </p>
                );
              })}
              <div className="immersive-item__detail-meta">
                {item.meta.map((m, mi) => (
                  <span key={m} className="immersive-item__detail-tag" style={{ animationDelay: `${0.9 + mi * 0.12}s` }}>{m}</span>
                ))}
              </div>
            </div>

            {/* 导航 */}
            <div className="immersive-item__detail-nav">
              <button className="immersive-item__nav-btn" onClick={onPrev} disabled={isFirst}>
                <span className="immersive-item__nav-arrow">←</span> 上一段
              </button>


              <button className="immersive-item__nav-btn" onClick={onNext} disabled={isLast}>
                {isLast ? "已是最后" : <>下一段 <span className="immersive-item__nav-arrow">→</span></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   沉浸模式容器
══════════════════════════════════════════ */
function ImmersiveMode() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrack, setShowTrack] = useState(false);
  const item = TIMELINE_ITEMS[currentIndex];

  const goTo = useCallback((i) => setCurrentIndex(i), []);

  return (
    <div className="immersive-mode">
      <ImmersiveItem
        key={currentIndex}
        item={item}
        index={currentIndex}
        total={TIMELINE_ITEMS.length}
        isFirst={currentIndex === 0}
        isLast={currentIndex === TIMELINE_ITEMS.length - 1}
        onNext={() => setCurrentIndex((i) => Math.min(i + 1, TIMELINE_ITEMS.length - 1))}
        onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
      />

      {/* 底部轨道切换按钮 */}
      <button
        className={`immersive-track-toggle${showTrack ? " open" : ""}`}
        onClick={() => setShowTrack((v) => !v)}
        title="历史轨道"
      >
        {showTrack ? "收起轨道 ▲" : "历史轨道 ▼"}
      </button>

      {showTrack && (
        <TimelineTrack items={TIMELINE_ITEMS} currentIndex={currentIndex} onSelect={(i) => { goTo(i); setShowTrack(false); }} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   长图模式（原有逻辑）
══════════════════════════════════════════ */
function ScrollMode() {
  const shellRef = useRef(null);
  const [preview, setPreview] = useState(null); // { src, label }

  // 点击图片放大
  const openPreview = useCallback((src, label) => {
    setPreview({ src, label });
  }, []);

  const closePreview = useCallback(() => {
    setPreview(null);
  }, []);

  // meta 标签涟漪
  const handleMetaClick = useCallback((e) => {
    const el = e.currentTarget;
    el.classList.remove("ripple");
    void el.offsetWidth; // reflow
    el.classList.add("ripple");
    el.addEventListener("animationend", () => el.classList.remove("ripple"), { once: true });
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const items = Array.from(shell.querySelectorAll(".item"));
    if (items.length === 0) return;

    const setActiveItem = (index) => {
      items.forEach((el) => el.classList.remove("item--active"));
      const target = items[index];
      if (!target) return;
      target.classList.add("item--active");
      const bg = target.getAttribute("data-bg");
      if (bg) shell.style.backgroundImage = `url(${bg})`;
    };

    setActiveItem(0);
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const pos = window.scrollY, len = items.length;
        items.forEach((item, i) => {
          const min = item.offsetTop, max = item.offsetTop + item.offsetHeight;
          if (i === len - 2 && pos > min + item.offsetHeight / 2) { setActiveItem(len - 1); return; }
          if (pos >= min && pos <= max - 10) setActiveItem(i);
        });
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="timeline-page">
      {preview && (
        <div className="history-timeline__img-preview" onClick={closePreview}>
          <img src={preview.src} alt={preview.label} />
          {preview.label && (
            <span className="history-timeline__img-preview-label">{preview.label}</span>
          )}
        </div>
      )}
      <div className="shell" ref={shellRef} id="shell">
        <div className="top">
          <h2 className="title">
            {"平遥古城历史脉络".split("").map((ch, i) => (
              <span key={i} className="title-char" style={{ animationDelay: `${i * 0.08}s` }}>{ch}</span>
            ))}
          </h2>
          <h3 className="subtitle">从西周始建到现代保护</h3>
        </div>
        <div className="timeline">
          {TIMELINE_ITEMS.map((entry) => (
            <div key={entry.text} className="item" data-text={entry.text} data-bg={entry.bg}>
              <div
                className="content"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + "%";
                  const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + "%";
                  e.currentTarget.style.setProperty("--mx", x);
                  e.currentTarget.style.setProperty("--my", y);
                }}
              >
                <div className="image-gallery">
                  <div className="image-container main-image">
                    <img
                      className="img"
                      src={entry.image}
                      alt={entry.imageAlt}
                      onClick={() => openPreview(entry.image, entry.imageLabel)}
                    />
                    <div className="image-overlay">
                      <span className="overlay-text">{entry.imageLabel}</span>
                    </div>
                  </div>
                </div>
                <h2 className="content-title">{entry.year}</h2>
                <div className="content-body">
                  {entry.description.map((para) => {
                    const sep = para.indexOf("：");
                    if (sep === -1) return <p key={para} className="content-desc">{para}</p>;
                    return (
                      <p key={para} className="content-desc">
                        <strong>{para.slice(0, sep + 1)}</strong>
                        {para.slice(sep + 1)}
                      </p>
                    );
                  })}
                  <div className="timeline-meta">
                    {entry.meta.map((m) => (
                      <span key={m} className="meta-item" onClick={handleMetaClick}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   主组件
══════════════════════════════════════════ */
function Timeline() {
  const [viewMode, setViewMode] = useState("immersive");

  return (
    <div className="history-timeline">
      {/* 右上角单入口切换按钮 */}
      <button
        className="history-timeline__mode-switch-btn"
        onClick={() => setViewMode((m) => m === "immersive" ? "scroll" : "immersive")}
        title={viewMode === "immersive" ? "切换到长图模式" : "切换到沉浸模式"}
      >
        <span className="history-timeline__mode-icon">
          {viewMode === "immersive" ? "☰" : "◈"}
        </span>
        {viewMode === "immersive" ? "长图模式" : "沉浸模式"}
      </button>

      {viewMode === "immersive" ? <ImmersiveMode /> : <ScrollMode />}
    </div>
  );
}

export default Timeline;
