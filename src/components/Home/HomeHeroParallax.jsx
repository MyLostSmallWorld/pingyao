import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AncientSceneBackground from "./AncientSceneBackground.jsx";
import IntroInkParticles from "./IntroInkParticles.jsx";
import bgmUrl from "../../assets/audio/bgm1.mp3?url";
import scrollCloseSfxUrl from "../../assets/audio/scroll-close.wav?url";
import beimenGongjiUrl from "../../assets/images/home/beimen-gongji.jpg";
import circleLayerUrl from "../../assets/images/home/circle-layer.png";
import fontPosterUrl from "../../assets/images/home/font.png";
import lfquThumbUrl from "../../assets/images/home/LFQU2Nj.png";
import mxrCloudUrl from "../../assets/images/home/MXrEHi7.png";
import nanmenYingxunUrl from "../../assets/images/home/nanmen-yingxun.jpg";
import p1Url from "../../assets/images/home/p1.jpg";
import p2Url from "../../assets/images/home/p2.jpg";
import p3Url from "../../assets/images/home/p3.jpg";
import p4Url from "../../assets/images/home/p4.jpg";
import pingyaoMapUrl from "../../assets/images/home/pingyao_map_square_blended_2266.jpg";
import shangdongmenUrl from "../../assets/images/home/shangdongmen.jpg";
import shangximenYongdingUrl from "../../assets/images/home/shangximen-yongding.jpg";
import xiaximenUrl from "../../assets/images/home/xiaximen.jpg";
import yingxunGateUrl from "../../assets/images/home/yingxun-gate.png";
import yunCloudUrl from "../../assets/images/home/yun.png";

const scrollScenes = [
  { step: "01", start: 0 },
  { step: "02", start: 0.4 },
  { step: "03", start: 0.7 },
  { step: "04", start: 0.9 },
];

// const heroMapTwo = "/images/hero-map-02-v2.png"; // Removed per user request

const ACT1_IMAGES = {
  circle: circleLayerUrl,
  gate: yingxunGateUrl,
};

/** 扇形菜单弹窗图集：全部使用本地资源，保证比赛线上展示稳定。 */
const galleryData = {
  chengqiang: [
    { img: nanmenYingxunUrl, text: "迎薰门 — 龟首入口" },
    { img: shangdongmenUrl, text: "太和门 — 东足节点" },
    { img: shangximenYongdingUrl, text: "永定门 — 西足节点" },
    { img: beimenGongjiUrl, text: "拱极门 — 龟尾水势" },
  ],
  piaohao: [
    {
      img: p1Url,
      text: "迎薰门现场调研：游客导览以打卡为主，深度解读不足",
    },
    {
      img: p2Url,
      text: "文庙片区走访：历史信息分散，理解门槛较高",
    },
    {
      img: p3Url,
      text: "票号院落实拍：建筑精彩，但内容关联展示不连续",
    },
    {
      img: p4Url,
      text: "日昇昌调研：由“看景点”转向“读关系”成为核心需求",
    },
  ],
  yamen: [
    { img: pingyaoMapUrl, text: "古城格局" },
    { img: xiaximenUrl, text: "城门形制" },
    { img: nanmenYingxunUrl, text: "迎薰门线索" },
  ],
  miao: [
    { img: fontPosterUrl, text: "指尖平遥" },
    { img: p3Url, text: "院落细部" },
    { img: p4Url, text: "文化线索" },
  ],
  tese: [
    { img: p1Url, text: "推光漆器" },
    { img: p2Url, text: "牛肉与碗托" },
    { img: p4Url, text: "民俗节庆" },
  ],
};

const TURTLE_SECTION_ID = "home-turtle-city";
const HE_JUAN_DURATION = 1.35;
const HE_JUAN_SFX_VOLUME = 0.35;
const GLOBAL_BGM_KEY = "__pinyao_travel_bgm__";
const GLOBAL_BGM_URL = bgmUrl;

function playHeJuanSfx() {
  const audio = new Audio(scrollCloseSfxUrl);
  audio.preload = "auto";
  audio.volume = HE_JUAN_SFX_VOLUME;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

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
const YINGXUN_INTRO_TEXT = `迎薰门，是平遥古城面向南方的第一道叙事入口，因“迎纳和薰之风”而得名。

它既是南门，也是“龟城”的龟首。由这里入城，城墙、街巷、票号与寺庙不再是分散景点，而会被串成一条可阅读的古城线索。

关键词：迎薰门 / 龟首 / 入城线索`;

const GUCHENG_OVERVIEW_TEXT = `平遥不是单一景点，而是一套保存完整的明清县城系统。

城墙定义边界，街巷组织生活，票号连接商业，寺庙与民俗沉淀地方记忆。它的价值不只在古建筑本身，更在于这些空间关系今天仍然清晰可读。

关键词：龟城格局 / 明清县城 / 生活遗产`;

const SHIDI_RESEARCH_TEXT = `我们走访了迎薰门、文庙、票号院落与日昇昌等点位，发现游客常停留在拍照和打卡层面。

真正困难的是：建筑、人物、商业网络与地方记忆之间的关系，往往被分散在不同展牌和空间里。

因此，我们把这些线索重新串联，让用户从“看见平遥”进一步走向“读懂平遥”。`;

const WENHUA_YICHAN_TEXT = `平遥的遗产价值，藏在不同空间彼此相连的关系里。

城墙守住边界，票号讲述商业，寺庙保存信仰，民俗延续日常。它们共同构成一座古城的气韵，而不是几处孤立的景点。

关键词：空间关系 / 文化记忆 / 数字叙事`;

const MIAO_POPUP_IMAGE = fontPosterUrl;

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
    playHeJuanSfx();

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
                    aria-label="打开一眼读懂平遥"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("一眼读懂平遥", "chengqiang");
                    }}
                  />
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--2"
                    aria-label="打开为什么重构导览"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("为什么重构导览", "piaohao");
                    }}
                  />
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--3"
                    aria-label="打开遗产如何彼此相连"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("遗产如何彼此相连", "yamen");
                    }}
                  />
                  <button
                    type="button"
                    className="home-act1__nav-btn home-act1__nav-btn--4"
                    aria-label="打开指尖平遥"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("指尖平遥", "miao");
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
                    aria-label="打开从南门进入龟城"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow("从南门进入龟城", "tese");
                    }}
                  >
                    <img
                      src={lfquThumbUrl}
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
                    aria-label="指尖平遥"
                  >
                    <img
                      className="home-act1__poster-window-image"
                      src={MIAO_POPUP_IMAGE}
                      alt="指尖平遥"
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
                      aria-label="关闭弹窗"
                      onClick={closeWindow}
                    >
                      &times;
                    </button>
                    <h3
                      id="home-act1-popup-title"
                      className="home-act1__popup-title"
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
                  <img src={mxrCloudUrl} alt="" />
                </div>
                <div className="home-act1__cloud home-act1__cloud--ccw">
                  <img src={yunCloudUrl} alt="" />
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
                <img src={lfquThumbUrl} alt="" />
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
