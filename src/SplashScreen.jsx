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
    </div>
  );
}
