import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AncientSceneBackground from "./AncientSceneBackground.jsx";
import IntroInkParticles from "./IntroInkParticles.jsx";
import "./ancient-scroll-intro.css";
import scrollOpenSfxUrl from "../../assets/audio/scroll-open.wav?url";
import scrollMapUrl from "../../assets/images/home/yingxun-scroll-map.png";

const OPEN_DELAY_MS = 400;
const WIDTH_DURATION_S = 2.2;
const OPEN_HOLD_MS = 450;
const EXIT_FADE_S = 0.38;
const OPEN_SFX_VOLUME = 0.45;

function playScrollSfx(url, volume) {
  const audio = new Audio(url);
  audio.preload = "auto";
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // 浏览器可能拦截自动播放音效，忽略即可，不影响首页动画。
  });
}

function ScrollIntroMap() {
  return (
    <div className="map-scroll-content">
      <div className="map-image-container">
        <img
          src={scrollMapUrl}
          alt=""
          className="map-image"
          draggable={false}
        />
        <div className="map-aged-overlay" />
        <div className="map-vignette" />
      </div>
    </div>
  );
}

function Rod() {
  return (
    <div className="rod-body">
      <div className="rod-end rod-end-top" />
      <div className="rod-shaft">
        <div className="rod-grain" />
      </div>
      <div className="rod-end rod-end-bottom" />
    </div>
  );
}

/**
 * 首页开场：古卷轴展开 → 略停 → 淡入首页。
 */
export default function ScrollIntroOverlay({ onRevealAt45, onComplete }) {
  const [phase, setPhase] = useState("idle");
  const [exitFade, setExitFade] = useState(false);
  const revealRef = useRef(onRevealAt45);
  const completeRef = useRef(onComplete);
  const openSfxPlayedRef = useRef(false);

  revealRef.current = onRevealAt45;
  completeRef.current = onComplete;

  useEffect(() => {
    document.body.classList.add("home-intro-lock");
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setPhase("opening"), OPEN_DELAY_MS);
    return () => {
      clearTimeout(t);
      document.body.classList.remove("home-intro-lock");
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase !== "opening") return undefined;
    if (!openSfxPlayedRef.current) {
      openSfxPlayedRef.current = true;
      playScrollSfx(scrollOpenSfxUrl, OPEN_SFX_VOLUME);
    }
    const t = setTimeout(() => setPhase("open"), WIDTH_DURATION_S * 1000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "open") return undefined;
    const ids = [];
    ids.push(
      setTimeout(() => {
        revealRef.current?.();
        setExitFade(true);
        ids.push(
          setTimeout(() => {
            document.body.classList.remove("home-intro-lock");
            document.body.style.overflow = "auto";
            completeRef.current?.();
          }, Math.round(EXIT_FADE_S * 1000))
        );
      }, OPEN_HOLD_MS)
    );
    return () => ids.forEach((id) => clearTimeout(id));
  }, [phase]);

  const showScroll = phase === "opening" || phase === "open";
  const scrollWidth = showScroll ? "min(78vw, 860px)" : "0px";

  return (
    <motion.div
      className="ancient-scroll-intro-root"
      initial={{ opacity: 1 }}
      animate={{ opacity: exitFade ? 0 : 1 }}
      transition={{ duration: EXIT_FADE_S, ease: "easeOut" }}
      aria-hidden="true"
    >
      <AncientSceneBackground />

      <IntroInkParticles />

      <AnimatePresence>
        {showScroll ? (
          <motion.div
            className="ancient-scroll-intro-stage"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="ancient-scroll-intro-row"
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="scroll-rod">
                <Rod />
              </div>

              <motion.div
                className="scroll-paper-wrap"
                initial={{ width: 0 }}
                animate={{ width: scrollWidth }}
                transition={{ duration: WIDTH_DURATION_S, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className="scroll-outer-border">
                  <div className="scroll-paper-body">
                    <div className="scroll-paper-texture" />
                    <div className="scroll-inner-border">
                      <div className="scroll-content">
                        <ScrollIntroMap />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="scroll-rod">
                <Rod />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
