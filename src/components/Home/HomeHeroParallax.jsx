import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AncientSceneBackground from "./AncientSceneBackground.jsx";
import IntroInkParticles from "./IntroInkParticles.jsx";

const scrollScenes = [
  { step: "01", start: 0 },
  { step: "02", start: 0.4 },
  { step: "03", start: 0.7 },
  { step: "04", start: 0.9 },
];

// const heroMapTwo = "/images/hero-map-02-v2.png"; // Removed per user request

const ACT1_IMAGES = {
  circle: "/src/assets/images/home/circle-layer.png",
  gate: "/src/assets/images/home/yingxun-gate.png",
};

/** 扇形菜单弹窗图集（图片来自原 Kashima 演示，可后续替换为平遥实拍） */
const galleryData = {
  chengqiang: [
    { img: "https://i.imgur.com/uie0DYt.png", text: "城墙角楼 — 推荐打卡" },
    { img: "https://i.imgur.com/sr5Nzcl.png", text: "垛口漫步" },
    { img: "https://i.imgur.com/0fXRCH0.png", text: "护城河视角" },
    { img: "https://i.imgur.com/rtSTqzj.png", text: "瓮城光影" },
  ],
  piaohao: [
    {
      img: "/src/assets/images/home/p1.jpg",
      text: "迎薰门现场调研：游客导览以打卡为主，深度解读不足",
    },
    {
      img: "/src/assets/images/home/p2.jpg",
      text: "文庙片区走访：历史信息分散，理解门槛较高",
    },
    {
      img: "/src/assets/images/home/p3.jpg",
      text: "票号院落实拍：建筑精彩，但内容关联展示不连续",
    },
    {
      img: "/src/assets/images/home/p4.jpg",
      text: "日昇昌调研：由“看景点”转向“读关系”成为核心需求",
    },
  ],
  yamen: [
    { img: "https://i.imgur.com/azpsGoK.png", text: "大堂楹联" },
    { img: "https://i.imgur.com/mL3Jbv8.png", text: "牢狱展区" },
    { img: "https://i.imgur.com/Ve30zuN.png", text: "升堂场景" },
  ],
  miao: [
    { img: "https://i.imgur.com/qDm4na0.png", text: "双林彩塑" },
    { img: "https://i.imgur.com/r1R6SLG.png", text: "镇国寺大殿" },
    { img: "https://i.imgur.com/Jh2Q3kv.png", text: "寺观古柏" },
  ],
  tese: [
    { img: "https://i.imgur.com/lWbeAMh.png", text: "推光漆器" },
    { img: "https://i.imgur.com/UJlJTyn.png", text: "牛肉与碗托" },
    { img: "https://i.imgur.com/4zKFMi1.png", text: "民俗节庆" },
  ],
};

const TURTLE_SECTION_ID = "home-turtle-city";
const HE_JUAN_DURATION = 1.35;
const GLOBAL_BGM_KEY = "__pinyao_travel_bgm__";
const GLOBAL_BGM_URL = "/src/assets/audio/bgm1.mp3";

function getGlobalBgmAudio() {
  if (typeof window === "undefined") return null;
  if (window[GLOBAL_BGM_KEY] instanceof HTMLAudioElement) {
    return window[GLOBAL_BGM_KEY];
  }

  const audio = new Audio(GLOBAL_BGM_URL);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.3;
  window[GLOBAL_BGM_KEY] = audio;
  return audio;
}
const YINGXUN_INTRO_TEXT = `迎薰门是平遥古城南门（南瓮城门），面南偏东，因“迎纳和薰之风”而得名。

在“龟城”格局中，南门象征“龟首”，承载古城礼制、防御与人文象征。由迎薰门入城，正是读懂平遥的第一步。`;

const GUCHENG_OVERVIEW_TEXT = `平遥古城，位于山西省晋中市平遥县。始建于西周宣王时期（前827年—前782年），于明代洪武三年（1370年）重建、扩修城池，是现今中国境内保存最为完整的一座古代县城，整座城池宛如乌龟向南爬行，因此有“龟城”之称。

平遥古城由城墙、店铺、街道、寺庙、民居等共同组成一个庞大的建筑群，整座城池对称布局，以市楼为轴心，以南大街为轴线，形成左城隍、右衙署，左文庙、右武庙，东道观、西寺庙的封建礼制格局，总占地面积2.25平方千米；城内街道格局为“土”字形，整体布局遵从八卦方位，由四大街、八小巷、七十二条蚰蜒巷构成八卦图案，南大街、东大街、西大街、衙门街和城隍庙街形成干字型商业街。

平遥古城是中国汉民族城市在明清时期的杰出范例，它保存了其所有特征，而且在中国历史的发展中为人们展示了一幅非同寻常的文化、经济、社会及宗教发展的完整画卷。平遥古城内的街道商铺都体现历史原貌，设计布局体现了明清时期城市规划理念和形制分布，展示了五个世纪以来中国建筑风格和城市规划的演变，被称为研究中国古代城市的活样本，在建筑、宗教、商业、民俗、民间艺术上具有丰富且独特的价值。

1997年12月3日，平遥古城与周边的双林寺、镇国寺共同被联合国教科文组织确定为世界文化遗产，列入《世界遗产名录》。2015年7月20日，山西省晋中市平遥古城景区获批为国家AAAAA级旅游景区。成为山西省第六家国家AAAAA级旅游景区。2025年，平遥古城共接待游客1108.54万人次。`;

const SHIDI_RESEARCH_TEXT = `我们在平遥古城开展了多点位实地调研，重点走访了迎薰门、文庙、票号院落与日昇昌等区域。

调研中我们发现：现场信息展示较为分散，游客多停留在“看景点、拍照片”层面，建筑、历史人物与晋商文化之间的关联难以快速建立，跨点位的整体理解成本较高。

基于这些问题，我们决定做这个网站：把分散内容串联成可浏览、可追溯、可交互的数字叙事，让用户从“看见古城”进一步走向“读懂平遥”。`;

const WENHUA_YICHAN_TEXT = `平遥的文化遗产之美，不只在古建筑本身，更在于城墙、街巷、票号、寺庙与民俗共同构成的整体气韵。

我们同样被平遥的营造技艺与民俗非遗深深吸引：从古建形制与工艺细部，到节庆礼俗与民间手艺，都展现出鲜活而厚重的文化生命力。

我们希望借助这个网站，把分散在不同点位的历史线索重新组织起来，用更直观的方式讲清楚平遥的文化价值，让更多人看见它的美、理解它的深厚。`;

const MIAO_POPUP_IMAGE = "/src/assets/images/home/font.png";

function getSceneIndex(progress) {
  let currentIndex = 0;

  for (let index = 0; index < scrollScenes.length; index += 1) {
    if (progress >= scrollScenes[index].start) {
      currentIndex = index;
    }
  }

  return currentIndex;
}

function HomeHeroParallax() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const heroSceneRef = useRef(null);
  const act1Ref = useRef(null);
  const heroScrollTriggerRef = useRef(null);
  const heJuanTweenRef = useRef(null);
  const heJuanPlayingRef = useRef(false);
  const [progress, setProgress] = useState(0);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupType, setPopupType] = useState(null);

  const openWindow = useCallback((title, type) => {
    setPopupTitle(title);
    setPopupType(type);
    setPopupOpen(true);
  }, []);

  const closeWindow = useCallback(() => {
    setPopupOpen(false);
    setPopupType(null);
  }, []);

  const goToTurtleCity = useCallback(() => {
    closeWindow();
    const section = sectionRef.current;
    const st = heroScrollTriggerRef.current;
    const heroEl = heroSceneRef.current;
    const act1El = act1Ref.current;

    if (!section || !heroEl || !act1El) {
      document
        .getElementById(TURTLE_SECTION_ID)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }

    if (st?.progress >= 0.995) {
      document
        .getElementById(TURTLE_SECTION_ID)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }

    if (heJuanPlayingRef.current) return;
    heJuanPlayingRef.current = true;
    heJuanTweenRef.current?.kill();

    const circle = section.querySelector(".home-act1__circle");
    const gate = section.querySelector(".home-act1__gate");
    const clouds = section.querySelectorAll(".home-act1__cloud");
    const aside = section.querySelector(".home-act1__aside");

    const tl = gsap.timeline({
      onComplete: () => {
        heJuanTweenRef.current = null;
        heJuanPlayingRef.current = false;
        const endY =
          st?.end ??
          Math.max(
            0,
            section.offsetTop + section.offsetHeight - window.innerHeight,
          );
        window.scrollTo({ top: endY, left: 0, behavior: "instant" });
        setProgress(1);
        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          document
            .getElementById(TURTLE_SECTION_ID)
            ?.scrollIntoView({ behavior: "instant", block: "start" });
        });
      },
    });

    heJuanTweenRef.current = tl;

    tl.to(heroEl, {
      opacity: 0,
      duration: HE_JUAN_DURATION,
      ease: "power2.inOut",
    }).to(
      act1El,
      {
        scaleX: 0.04,
        opacity: 0,
        pointerEvents: "none",
        duration: HE_JUAN_DURATION,
        ease: "power2.inOut",
      },
      "<",
    );

    if (circle) {
      tl.to(
        circle,
        {
          scale: 0.01,
          opacity: 0,
          duration: HE_JUAN_DURATION,
          ease: "power2.inOut",
        },
        "<",
      );
    }
    if (gate) {
      tl.to(
        gate,
        {
          scale: 0.8,
          opacity: 0,
          duration: HE_JUAN_DURATION,
          ease: "power2.inOut",
        },
        "<",
      );
    }
    if (clouds.length) {
      tl.to(clouds, { opacity: 0, duration: 1.0 }, "<");
    }
    if (aside) {
      tl.to(aside, { opacity: 0, duration: 1.0 }, "<");
    }
  }, [closeWindow]);

  const tryPlayAudio = useCallback(() => {
    const audio = getGlobalBgmAudio();
    if (audio && audio.paused) {
      audio.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return undefined;

    const ctx = gsap.context(() => {
      if (heroSceneRef.current) {
        gsap.set(heroSceneRef.current, { opacity: 1 });
      }
      if (act1Ref.current) {
        gsap.set(act1Ref.current, {
          opacity: 1,
          scaleX: 1,
          transformOrigin: "center center",
          pointerEvents: "auto",
        });
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          pin: sticky,
          pinSpacing: false,
          anticipatePin: 1,
          scrub: true,
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        },
      });

      timeline
        .to(
          heroSceneRef.current,
          {
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
          },
          0.35,
        )
        .to(
          act1Ref.current,
          {
            scaleX: 0.04,
            opacity: 0,
            pointerEvents: "none",
            duration: 1.5,
            ease: "power2.inOut",
          },
          "<",
        )
        .to(
          ".home-act1__circle", // 获取圆圈，将其缩小
          {
            scale: 0.01,
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
          },
          "<", // 同步执行
        )
        .to(
          ".home-act1__gate", // 迎薰门同步消失
          {
            scale: 0.8,
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
          },
          "<",
        )
        .to(
          ".home-act1__cloud", // 云纹同步消失
          {
            opacity: 0,
            duration: 1.0,
          },
          "<",
        )
        .to(
          ".home-act1__aside", // 旁侧图片同步消失
          {
            opacity: 0,
            duration: 1.0,
          },
          "<",
        )
        // 收尾留极短过渡，直接进入下一幕
        .to({}, { duration: 0.25 });

      heroScrollTriggerRef.current = timeline.scrollTrigger ?? null;
    }, section);

    return () => {
      heJuanTweenRef.current?.kill();
      heJuanTweenRef.current = null;
      heroScrollTriggerRef.current = null;
      ctx.revert();
    };
  }, []);

  const safeSceneIndex = getSceneIndex(progress);

  const goScene = (index) => {
    const section = sectionRef.current;
    if (!section) return;

    const maxDistance = section.offsetHeight - window.innerHeight;
    const targetY = section.offsetTop + maxDistance * scrollScenes[index].start;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const gridItems = popupType ? (galleryData[popupType] ?? []) : [];
  const isYingxunIntro = popupType === "tese";
  const isGuchengOverview = popupType === "chengqiang";
  const isShidiResearch = popupType === "piaohao";
  const isWenhuaYichan = popupType === "yamen";
  const isMiaoPoster = popupType === "miao";
  const popupIntroText = isYingxunIntro
    ? YINGXUN_INTRO_TEXT
    : isGuchengOverview
      ? GUCHENG_OVERVIEW_TEXT
      : isShidiResearch
        ? SHIDI_RESEARCH_TEXT
        : isWenhuaYichan
          ? WENHUA_YICHAN_TEXT
          : "";
  const shouldShowGrid =
    !isYingxunIntro && !isGuchengOverview && !isWenhuaYichan && !isMiaoPoster;

  return (
    <section className="scroll-demo" ref={sectionRef}>
      <div
        className="scroll-demo__sticky"
        ref={stickyRef}
        onClick={tryPlayAudio}
      >
        <div className="scroll-demo__visuals">
          <div ref={heroSceneRef} className="hero-ancient-scene">
            <AncientSceneBackground layer />
            <IntroInkParticles variant="layer" />
          </div>

          <div className="scroll-demo__black-line-overflow" />

          <div ref={act1Ref} className="home-act1">
            <div className="home-act1__scroll-edge home-act1__scroll-edge--left" />
            <div className="home-act1__scroll-edge home-act1__scroll-edge--right" />

            <div className="home-act1__main">
              <div className="home-act1__gate-wrap">
                <div className="home-act1__buttons-layer">
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("古城概要", "chengqiang");
                    }}
                  />
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("实地调研", "piaohao");
                    }}
                  />
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--3"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("平遥遗珍", "yamen");
                    }}
                  />
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--4"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("寺观彩塑", "miao");
                    }}
                  />
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--5"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToTurtleCity();
                    }}
                    aria-label="合卷，进入龟城形制"
                  />
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--special"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("迎薰启城", "tese");
                    }}
                  >
                    <img
                      src="/src/assets/images/home/LFQU2Nj.png"
                      alt="精选"
                      className="home-act1__special-thumb"
                    />
                  </button>
                </div>

                {popupOpen && isMiaoPoster ? (
                  <div
                    className="home-act1__poster-window"
                    role="dialog"
                    aria-modal="true"
                    aria-label="寺观彩塑"
                  >
                    <img
                      className="home-act1__poster-window-image"
                      src={MIAO_POPUP_IMAGE}
                      alt="寺观彩塑"
                    />
                  </div>
                ) : (
                  <div
                    className="home-act1__popup"
                    style={{ display: popupOpen ? "block" : "none" }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="home-act1-popup-title"
                  >
                    <button
                      type="button"
                      className="home-act1__popup-close"
                      onClick={closeWindow}
                    >
                      &times;
                    </button>
                    <h3
                      id="home-act1-popup-title"
                      style={{
                        margin: 0,
                        color: "var(--home-act1-accent)",
                        borderBottom: "1px solid var(--home-act1-accent)",
                      }}
                    >
                      {popupTitle}
                    </h3>
                    <div className="home-act1__popup-body">
                      {popupIntroText ? (
                        <p
                          className={
                            isShidiResearch
                              ? "home-act1__intro-text home-act1__intro-text--with-gallery"
                              : "home-act1__intro-text"
                          }
                        >
                          {popupIntroText}
                        </p>
                      ) : null}

                      {shouldShowGrid ? (
                        <div className="home-act1__grid is-visible">
                          {gridItems && gridItems.length > 0 ? (
                            <div className="home-act1__grid-inner">
                              {gridItems.map((it, idx) => (
                                <figure className="home-act1__tile" key={idx}>
                                  <img src={it.img} alt={it.text} />
                                  <figcaption className="home-act1__tile-caption">
                                    {it.text}
                                  </figcaption>
                                </figure>
                              ))}
                            </div>
                          ) : (
                            <p className="home-act1__empty">暂无内容</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="home-act1__cloud home-act1__cloud--cw">
                  <img src="/src/assets/images/home/MXrEHi7.png" alt="" />
                </div>
                <div className="home-act1__cloud home-act1__cloud--ccw">
                  <img src="https://i.imgur.com/uFqyxPW.png" alt="" />
                </div>
                <div className="home-act1__circle-shell">
                  <img
                    src={ACT1_IMAGES.circle}
                    className="home-act1__circle"
                    alt=""
                  />
                </div>
                <div className="home-act1__gate-shell">
                  <img
                    src={ACT1_IMAGES.gate}
                    className="home-act1__gate"
                    alt="平遥古城迎薰门立绘"
                  />
                </div>
              </div>

              <div
                className={`home-act1__aside ${popupOpen ? "home-act1__aside--popup-open" : ""}`}
              >
                <img src="/src/assets/images/home/LFQU2Nj.png" alt="" />
              </div>
            </div>
          </div>

          <div className="scroll-demo__fade" />
        </div>

        <div className="scroll-demo__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${0.08 + progress * 0.92})` }} />
        </div>
      </div>
    </section>
  );
}

export default HomeHeroParallax;
