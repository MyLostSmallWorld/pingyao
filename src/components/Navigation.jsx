import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

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

const navItems = [
  { to: "/", label: "首页", end: true },
  { to: "/explore", label: "营造技艺" },
  { to: "/merchant", label: "晋商文化" },
  { to: "/ask", label: "民俗非遗" },
  { to: "/travel", label: "旅游路线" },
];

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [homeIntroFinished, setHomeIntroFinished] = useState(false);
  const [bgmOn, setBgmOn] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const toggleBgm = () => {
    const audio = getGlobalBgmAudio();
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {});
      setBgmOn(true);
      return;
    }

    audio.pause();
    setBgmOn(false);
  };

  useEffect(() => {
    setMenuOpen(false);
    setHomeIntroFinished(!isHome);
    // 首页也默认显示导航；仅在向下滚动时隐藏
    // 民俗非遗页面全屏展示，隐藏导航栏
    if (location.pathname === "/ask") {
      setHeaderVisible(false);
    } else {
      setHeaderVisible(true);
    }
  }, [isHome, location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const threshold = 4;

    const getHomeThreshold = () => {
      const introSection = document.querySelector(".scroll-demo");
      if (!introSection) {
        return window.innerHeight;
      }

      return Math.max(
        introSection.offsetHeight - window.innerHeight,
        window.innerHeight * 0.8,
      );
    };

    const onScroll = () => {
      const currentY = window.scrollY;

      if (isHome) {
        const introFinished = currentY >= getHomeThreshold() - 8;
        setHomeIntroFinished(introFinished);
      }

      if (currentY <= 12) {
        setHeaderVisible(true);
        lastY = currentY;
        return;
      }

      if (currentY < lastY - threshold) {
        setHeaderVisible(true);
      } else if (currentY > lastY + threshold) {
        setHeaderVisible(false);
      }

      lastY = currentY;
    };

    const onWheel = (event) => {
      if (menuOpen) return;
      if (Math.abs(event.deltaY) < 6) return;
      setHeaderVisible(event.deltaY < 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", onWheel);
    };
  }, [isHome, menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      setHeaderVisible(true);
    }
  }, [menuOpen]);

  useEffect(() => {
    const onMessage = (event) => {
      const data = event.data;
      if (!data) return;
      
      // 处理导航栏显示/隐藏
      if (data.type === "hide-nav") {
        setHeaderVisible(!data.hidden);
        return;
      }
      
      // 处理滚动方向
      if (data.type === "pinyao-nav-scroll") {
        if (menuOpen) return;
        setHeaderVisible(data.direction !== "down");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [menuOpen]);

  useEffect(() => {
    const audio = getGlobalBgmAudio();
    if (!audio) return undefined;

    const syncState = () => setBgmOn(!audio.paused);
    syncState();

    audio.addEventListener("play", syncState);
    audio.addEventListener("pause", syncState);
    return () => {
      audio.removeEventListener("play", syncState);
      audio.removeEventListener("pause", syncState);
    };
  }, []);

  return (
    <header
      className={
        headerVisible
          ? "site-header site-header--visible"
          : "site-header site-header--hidden"
      }
      data-home-intro-finished={homeIntroFinished ? "true" : "false"}
    >
      <div className="site-header__inner">
        <div className="site-brand">
          <div className="site-brand__text">
            <span className="site-brand__title">指尖平遥</span>
            <span className="site-brand__subtitle">平遥文化遗产叙事引擎</span>
          </div>
        </div>
        <nav
          className={menuOpen ? "site-nav is-open" : "site-nav"}
          aria-label="主导航"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "site-nav__link is-active" : "site-nav__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-header__actions">
          <button
            type="button"
            className={bgmOn ? "site-bgm-toggle is-on" : "site-bgm-toggle"}
            aria-label={bgmOn ? "关闭背景音乐" : "开启背景音乐"}
            title={bgmOn ? "关闭背景音乐" : "开启背景音乐"}
            onClick={toggleBgm}
          >
            ♪
          </button>
          <button
            type="button"
            className={
              menuOpen ? "site-menu-toggle is-open" : "site-menu-toggle"
            }
            aria-expanded={menuOpen}
            aria-label="切换导航菜单"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
