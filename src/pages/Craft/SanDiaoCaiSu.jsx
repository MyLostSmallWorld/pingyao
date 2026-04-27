import "./SanDiaoCaiSu.css";

export default function SanDiaoCaiSu() {
  return (
    <div
      className="sandiao-iframe-wrapper"
      style={{ width: "100%", minHeight: "100vh" }}
    >
      <iframe
        src="/src/pages/Craft/sandiaoyucaihui.html" // 使用相对路径，指向当前目录下的文件
        title="三雕艺术·彩塑"
        style={{ border: "none", width: "100%", height: "100vh" }}
      />
    </div>
  );
}
