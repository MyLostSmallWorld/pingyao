import "../About.css";

function Merchant() {
  return (
    <section className="about-merchant">
      <iframe
        className="about-merchant__frame"
        src="/src/pages/Merchant/01_index.html"
        title="晋商文化专题"
        loading="eager"
      />
    </section>
  );
}

export default Merchant;
