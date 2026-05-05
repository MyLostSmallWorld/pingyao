import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";

const Home = lazy(() => import("./pages/Home/Home.jsx"));
const SanDiaoCaiSu = lazy(() => import("./pages/Craft/SanDiaoCaiSu.jsx"));
const Merchant = lazy(() => import("./pages/Merchant/Merchant.jsx"));
const Ask = lazy(() => import("./pages/Folk/Ask.jsx"));
const Travel = lazy(() => import("./pages/Route/Travel.jsx"));
const Timeline = lazy(() => import("./components/Route/Timeline.jsx"));
const About = lazy(() => import("./pages/About.jsx"));

function AppContent() {
  const location = useLocation();
  const isFullBleedRoute = [
    "/",
    "/timeline",
    "/explore",
    "/travel",
    "/ask",
    "/merchant",
  ].includes(location.pathname);
  const pageShellClassName = isFullBleedRoute
    ? "page-shell page-shell--fullbleed"
    : "page-shell";

  return (
    <div className="app-shell">
      <Navigation />
      <main className={pageShellClassName}>
        <Suspense fallback={<div className="route-loading">加载中...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<SanDiaoCaiSu />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/about" element={<About />} />
            <Route path="/merchant" element={<Merchant />} />
            <Route path="/travel" element={<Travel />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
