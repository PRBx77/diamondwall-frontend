import { useEffect, useRef } from "react";
export default function SplashScreen({ onEnter }) {
  const iframeRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (e.data === "DWALL_ENTER") onEnter();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onEnter]);
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "#08020c url(/DWALL-Fondo-1080.png) repeat center", backgroundSize: "500px auto"
    }}>
      <iframe
        ref={iframeRef}
        src="/splash.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="DiamondWall Intro"
      />
      <a href="https://skynet.certik.com/tools/token-scan/bsc/0xd8Dbf478436A5770A274658ab424c66139142839"
         target="_blank" rel="noopener noreferrer"
         style={{
           position: "absolute", top: "20px", right: "20px", zIndex: 100000,
           display: "inline-flex", alignItems: "center", gap: "8px",
           background: "#ffffff", border: "2px solid #10b981", borderRadius: "999px",
           padding: "8px 14px", textDecoration: "none", fontFamily: "sans-serif",
           boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
         }}>
        <img src="/certik.png" alt="CertiK" style={{ height: "16px", width: "auto" }} />
        <span style={{ color: "#000", fontWeight: 900, fontSize: "0.9rem" }}>86.27</span>
        <span style={{ color: "#000", fontSize: "0.7rem", fontWeight: 700 }}>/100</span>
      </a>
    </div>
  );
}
