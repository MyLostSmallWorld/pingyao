import { useState } from "react";
import HomeHeroParallax from "../../components/Home/HomeHeroParallax.jsx";
import ScrollIntroOverlay from "../../components/Home/ScrollIntroOverlay.jsx";
import TurtleCitySection from "../../components/Home/TurtleCitySection.jsx";
import WallSystemSection from "../../components/Home/WallSystemSection.jsx";

function Home() {
  const [introVisible, setIntroVisible] = useState(true);

  return (
    <div className="page page-home">
      {introVisible ? (
        <ScrollIntroOverlay
          onRevealAt45={() => setIntroVisible(false)}
          onComplete={() => setIntroVisible(false)}
        />
      ) : null}

      <div
        className={
          introVisible
            ? "page-home-intro-shell"
            : "page-home-intro-shell page-home-intro-shell--ready"
        }
      >
        <HomeHeroParallax />
        <TurtleCitySection />
        <WallSystemSection />
      </div>
    </div>
  );
}

export default Home;
