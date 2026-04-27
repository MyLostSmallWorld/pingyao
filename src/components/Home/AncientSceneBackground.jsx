import "./ancient-scroll-intro.css";

/**
 * 模仿/frontend Index 页的古风底景：渐变宣纸色 + 云雾 + 远山剪影
 * @param {object} props
 * @param {boolean} [props.layer=false] true 时用于首屏 sticky 内（absolute 铺满父级），false 时 fixed 全视口（开场遮罩）
 */
export default function AncientSceneBackground({ layer = false, className = "" }) {
  return (
    <div
      className={`ancient-bg ${layer ? "ancient-bg--layer" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="mountain-bg">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path
            d="M0,400 L0,280 Q120,200 200,250 Q280,180 360,220 Q420,140 500,190 Q560,120 640,170 Q720,80 800,150 Q880,90 960,140 Q1040,60 1120,130 Q1200,80 1280,160 Q1360,120 1440,200 L1440,400 Z"
            fill="oklch(0 0 0 / 0.04)"
          />
          <path
            d="M0,400 L0,320 Q160,260 280,290 Q400,240 500,270 Q600,220 720,260 Q840,200 960,250 Q1080,210 1200,240 Q1320,200 1440,260 L1440,400 Z"
            fill="oklch(0 0 0 / 0.025)"
          />
        </svg>
      </div>
    </div>
  );
}
