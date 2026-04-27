import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import ExploreGraph from "./pages/ExploreGraph.jsx";
import About from "./pages/About.jsx";

import Home from "./pages/Home/Home.jsx";
import SanDiaoCaiSu from "./pages/Craft/SanDiaoCaiSu.jsx";
import Merchant from "./pages/Merchant/Merchant.jsx";
import Ask from "./pages/Folk/Ask.jsx";
import Travel from "./pages/Route/Travel.jsx";
import Timeline from "./components/Route/Timeline.jsx";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<SanDiaoCaiSu />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/about" element={<About />} />
          <Route path="/merchant" element={<Merchant />} />
          <Route path="/travel" element={<Travel />} />
        </Routes>
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
