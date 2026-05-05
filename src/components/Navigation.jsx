import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const GLOBAL_BGM_KEY = "__pinyao_travel_bgm__";
const GLOBAL_BGM_URL = "/src/assets/audio/bgm1.mp3";
const API_BASE = "http://127.0.0.1:5000";

const navItems = [
  { to: "/", label: "首页", end: true },
  { to: "/explore", label: "营造技艺" },
  { to: "/merchant", label: "晋商文化" },
  { to: "/ask", label: "民俗非遗" },
  { to: "/travel", label: "旅游路线" },
];

const TAG_MAP = {
  1: "平遥古城",
  2: "平遥美食",
  3: "平遥非遗",
  4: "平遥旅游路线",
};

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

async function requestApi(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }

  return data;
}

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [homeIntroFinished, setHomeIntroFinished] = useState(false);
  const [bgmOn, setBgmOn] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({ content: "", tag: "", filterTag: "" });
  const location = useLocation();
  const isHome = location.pathname === "/";

  const toggleBgm = () => {
    const audio = getGlobalBgmAudio();
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      setBgmOn(true);
    } else {
      audio.pause();
      setBgmOn(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const data = await requestApi("/api/me", { method: "GET" });
      setCurrentUser(data.logged_in ? data.username : null);
      setCurrentUserId(data.logged_in ? data.user_id : null);
    } catch {
      setCurrentUser(null);
      setCurrentUserId(null);
    }
  };

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const query = new URLSearchParams({ page: String(currentPage) });
      if (commentForm.filterTag) query.set("tag", commentForm.filterTag);
      const data = await requestApi(`/api/comments?${query.toString()}`, { method: "GET" });
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitAuth = async () => {
    const username = authForm.username.trim();
    const password = authForm.password;

    if (!username) {
      alert("请输入用户名");
      return;
    }
    if (!password) {
      alert("请输入密码");
      return;
    }

    try {
      const data = await requestApi(authMode === "login" ? "/api/login" : "/api/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setCurrentUser(data.username);
      setCurrentUserId(data.user_id);
      setAuthForm({ username: "", password: "" });
      alert(data.msg);
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = async () => {
    try {
      const data = await requestApi("/api/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setCurrentUser(null);
      setCurrentUserId(null);
      alert(data.msg);
    } catch (error) {
      alert(error.message);
    }
  };

  const submitComment = async () => {
    if (!currentUser) {
      alert("请先登录后再发表评论");
      return;
    }
    if (!commentForm.content.trim()) {
      alert("请输入评论内容");
      return;
    }
    if (!commentForm.tag) {
      alert("请选择一个分类");
      return;
    }

    try {
      const data = await requestApi("/api/comment", {
        method: "POST",
        body: JSON.stringify({
          content: commentForm.content.trim(),
          tag: Number(commentForm.tag),
        }),
      });
      setCommentForm((prev) => ({ ...prev, content: "", tag: "" }));
      if (currentPage === 1) {
        await loadComments();
      } else {
        setCurrentPage(1);
      }
      alert(data.msg);
    } catch (error) {
      alert(error.message);
      if (error.message.includes("登录")) {
        setCurrentUser(null);
        setCurrentUserId(null);
      }
    }
  };

  const changeFilter = (value) => {
    setCurrentPage(1);
    setCommentForm((prev) => ({ ...prev, filterTag: value }));
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (boardOpen) loadCurrentUser();
  }, [boardOpen]);

  useEffect(() => {
    if (boardOpen) loadComments();
  }, [boardOpen, currentPage, commentForm.filterTag]);

  useEffect(() => {
    setMenuOpen(false);
    setHomeIntroFinished(!isHome);
    setHeaderVisible(location.pathname !== "/ask");
  }, [isHome, location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const threshold = 4;
    const getHomeThreshold = () => {
      const introSection = document.querySelector(".scroll-demo");
      if (!introSection) return window.innerHeight;
      return Math.max(introSection.offsetHeight - window.innerHeight, window.innerHeight * 0.8);
    };
    const onScroll = () => {
      const currentY = window.scrollY;
      if (isHome) setHomeIntroFinished(currentY >= getHomeThreshold() - 8);
      if (currentY <= 12) {
        setHeaderVisible(true);
        lastY = currentY;
        return;
      }
      setHeaderVisible(currentY < lastY - threshold || !(currentY > lastY + threshold));
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, menuOpen]);

  useEffect(() => {
    if (menuOpen) setHeaderVisible(true);
  }, [menuOpen]);

  useEffect(() => {
    const onMessage = (e) => {
      const d = e.data;
      if (d?.type === "hide-nav") setHeaderVisible(!d.hidden);
      if (d?.type === "pinyao-nav-scroll" && !menuOpen) setHeaderVisible(d.direction !== "down");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [menuOpen]);

  useEffect(() => {
    const audio = getGlobalBgmAudio();
    if (!audio) return;
    const sync = () => setBgmOn(!audio.paused);
    audio.onplay = sync;
    audio.onpause = sync;
    return () => {
      audio.onplay = null;
      audio.onpause = null;
    };
  }, []);

  return (
    <header
      className={headerVisible ? "site-header site-header--visible" : "site-header site-header--hidden"}
      data-home-intro-finished={homeIntroFinished ? "true" : "false"}
    >
      <div className="site-header__inner">
        <div className="site-brand">
          <div className="site-brand__text">
            <span className="site-brand__title">指尖平遥</span>
            <span className="site-brand__subtitle">平遥文化遗产叙事引擎</span>
          </div>
        </div>

        <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="主导航">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "site-nav__link is-active" : "site-nav__link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions" style={{ position: "relative" }}>
          <button type="button" className={bgmOn ? "site-bgm-toggle is-on" : "site-bgm-toggle"} onClick={toggleBgm}>
            BGM
          </button>

          <button
            type="button"
            className={menuOpen ? "site-menu-toggle is-open" : "site-menu-toggle"}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="打开菜单"
          >
            <span />
            <span />
            <span />
          </button>

          <button type="button" className="site-comment-toggle" onClick={() => setBoardOpen((prev) => !prev)}>
            留言
          </button>

          {boardOpen && (
            <div className="message-board">
              <div className="message-board__header">
                <h3>平遥古城留言板</h3>
                <button type="button" onClick={() => setBoardOpen(false)} aria-label="关闭留言板">
                  X
                </button>
              </div>

              <div className="message-board__auth">
                <div className="message-board__tabs">
                  <button
                    type="button"
                    className={authMode === "login" ? "is-active" : ""}
                    onClick={() => setAuthMode("login")}
                  >
                    登录
                  </button>
                  <button
                    type="button"
                    className={authMode === "register" ? "is-active" : ""}
                    onClick={() => setAuthMode("register")}
                  >
                    注册
                  </button>
                </div>

                {currentUser ? (
                  <div className="message-board__user">
                    <span>
                      已登录：{currentUser}
                      {currentUserId ? `（ID：${currentUserId}）` : ""}
                    </span>
                    <button type="button" onClick={logout}>
                      退出登录
                    </button>
                  </div>
                ) : (
                  <div className="message-board__login">
                    <input
                      value={authForm.username}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="用户名"
                    />
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="密码"
                    />
                    <button type="button" onClick={submitAuth}>
                      {authMode === "login" ? "立即登录" : "立即注册"}
                    </button>
                  </div>
                )}
              </div>

              <textarea
                maxLength="200"
                value={commentForm.content}
                onChange={(e) => setCommentForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder={currentUser ? "分享你的看法..." : "登录后才可以发表评论，但可以正常查看留言"}
                disabled={!currentUser}
              />

              <div className="message-board__tag-group">
                {Object.entries(TAG_MAP).map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="tag"
                      value={value}
                      checked={commentForm.tag === value}
                      disabled={!currentUser}
                      onChange={(e) => setCommentForm((prev) => ({ ...prev, tag: e.target.value }))}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="message-board__actions">
                <button type="button" onClick={submitComment}>
                  发布评论
                </button>
                <button type="button" onClick={loadComments}>
                  刷新评论
                </button>
              </div>

              <div className="message-board__filter">
                <label htmlFor="filterTag">按分类筛选：</label>
                <select id="filterTag" value={commentForm.filterTag} onChange={(e) => changeFilter(e.target.value)}>
                  <option value="">全部评论</option>
                  {Object.entries(TAG_MAP).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="message-board__list">
                {commentsLoading ? (
                  <p>评论加载中...</p>
                ) : comments.length === 0 ? (
                  <p>暂无评论，快来发表第一条吧。</p>
                ) : (
                  comments.map((item) => (
                    <div key={item.id} className="message-board__item">
                      <div className="message-board__item-head">
                        <strong>{item.username}</strong>
                        <span>{TAG_MAP[item.tag] || "未分类"}</span>
                      </div>
                      <time>{item.time}</time>
                      <div>{item.content}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="message-board__pager">
                <button type="button" onClick={prevPage} disabled={currentPage === 1}>
                  上一页
                </button>
                <span>第 {currentPage} 页</span>
                <button type="button" onClick={nextPage}>
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navigation;
