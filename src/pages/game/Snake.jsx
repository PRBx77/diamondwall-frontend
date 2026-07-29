import { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { getContracts } from "../../utils/web3";
import { useLang } from "../../i18n/LanguageContext";

const T = {
  title: { en: "DIAMONDSNAKE", es: "DIAMONDSNAKE" },
  tagline: { en: "Eat. Grow. Earn.", es: "Come. Crece. Gana." },
  musicOn: { en: "🎵 Music On", es: "🎵 Música on" },
  musicOff: { en: "🔇 Music Off", es: "🔇 Música off" },
  connect: { en: "Connect Wallet", es: "Conectar wallet" },
  connected: { en: "Connected:", es: "Conectada:" },
  claimed: { en: "✓ Airdrop already claimed", es: "✓ Airdrop ya reclamado" },
  score: { en: "Score", es: "Puntos" },
  high: { en: "High", es: "Récord" },
  speed: { en: "Speed", es: "Velocidad" },
  goal: { en: "Goal", es: "Meta" },
  start: { en: "▶ Start Game", es: "▶ Empezar partida" },
  restart: { en: "↻ Restart", es: "↻ Reiniciar" },
  pause: { en: "⏸ Pause", es: "⏸ Pausa" },
  resume: { en: "▶ Resume", es: "▶ Reanudar" },
  gameOver: { en: "GAME OVER", es: "GAME OVER" },
  victory: { en: "🏆 VICTORY!", es: "🏆 ¡VICTORIA!" },
  victorySub: { en: "You've reached the goal. Claim your on-chain reward.", es: "Has alcanzado la meta. Reclama tu recompensa on-chain." },
  claim: { en: "Claim 100 DWALL", es: "Reclamar 100 DWALL" },
  claiming: { en: "Claiming...", es: "Reclamando..." },
  connectToClaim: { en: "Connect your wallet to claim.", es: "Conecta tu wallet para reclamar." },
  alreadyClaimed: { en: "You've already claimed this airdrop.", es: "Ya has reclamado este airdrop." },
  controls: { en: "Controls: Arrow keys or WASD", es: "Controles: flechas o WASD" },
  install: { en: "Install MetaMask", es: "Instala MetaMask" },
  intro: {
    en: "Guide the diamond snake. Eat DWALL crystals to grow. Reach",
    es: "Guía a la serpiente diamante. Come cristales DWALL para crecer. Alcanza"
  },
  intro2: {
    en: "points to unlock your reward:",
    es: "puntos para desbloquear tu recompensa:"
  }
};

const GRID = 20;
const CELL = 22;
const CANVAS_SIZE = GRID * CELL;
const GOAL_SCORE = 200;
const POINTS_PER_FOOD = 10;
const BASE_SPEED_MS = 160;
const MIN_SPEED_MS = 60;

export default function Snake() {
  const { lang } = useLang();
  const t = (key) => T[key][lang] || T[key].en;

  const canvasRef = useRef(null);
  const ambientRef = useRef(null);
  const eatRef = useRef(null);
  const gameoverRef = useRef(null);

  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | playing | paused | gameover | victory
  const [account, setAccount] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [musicOn, setMusicOn] = useState(true);

  const dirRef = useRef(dir);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(0);

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    const saved = localStorage.getItem("dwall_snake_high");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = 0.12;
      ambientRef.current.loop = true;
    }
  }, []);

  const spawnFood = (currentSnake) => {
    let f;
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (currentSnake.some(s => s.x === f.x && s.y === f.y));
    return f;
  };

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // grid subtle
    ctx.strokeStyle = "rgba(34, 211, 238, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(CANVAS_SIZE, i * CELL);
      ctx.stroke();
    }

    // food (diamond)
    const fx = foodRef.current.x * CELL + CELL / 2;
    const fy = foodRef.current.y * CELL + CELL / 2;
    ctx.save();
    ctx.translate(fx, fy);
    const grad = ctx.createLinearGradient(-CELL/2, -CELL/2, CELL/2, CELL/2);
    grad.addColorStop(0, "#fef3c7");
    grad.addColorStop(0.5, "#fbbf24");
    grad.addColorStop(1, "#d97706");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -CELL/2 + 3);
    ctx.lineTo(CELL/2 - 3, 0);
    ctx.lineTo(0, CELL/2 - 3);
    ctx.lineTo(-CELL/2 + 3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fef3c7";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // snake
    snakeRef.current.forEach((seg, i) => {
      const x = seg.x * CELL;
      const y = seg.y * CELL;
      if (i === 0) {
        const g = ctx.createRadialGradient(x + CELL/2, y + CELL/2, 2, x + CELL/2, y + CELL/2, CELL/2);
        g.addColorStop(0, "#a5f3fc");
        g.addColorStop(1, "#0891b2");
        ctx.fillStyle = g;
      } else {
        const alpha = Math.max(0.35, 1 - i * 0.04);
        ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
      }
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x + 1, y + 1, CELL - 2, CELL - 2, 5) : ctx.rect(x + 1, y + 1, CELL - 2, CELL - 2);
      ctx.fill();
      if (i === 0) {
        ctx.fillStyle = "#0a0f1e";
        const dx = dirRef.current.x;
        const dy = dirRef.current.y;
        const eyeOff = 5;
        const cx = x + CELL/2;
        const cy = y + CELL/2;
        ctx.beginPath();
        ctx.arc(cx + dx * 3 - dy * eyeOff, cy + dy * 3 - dx * eyeOff, 2, 0, Math.PI * 2);
        ctx.arc(cx + dx * 3 + dy * eyeOff, cy + dy * 3 + dx * eyeOff, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  useEffect(() => {
    draw();
  }, [snake, food, draw]);

  const tick = useCallback(() => {
    const currentSnake = snakeRef.current;
    const d = dirRef.current;
    const head = currentSnake[0];
    const newHead = { x: head.x + d.x, y: head.y + d.y };

    // wall collision
    if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
      endGame(false);
      return;
    }
    // self collision
    if (currentSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      endGame(false);
      return;
    }

    let newSnake = [newHead, ...currentSnake];
    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      // eat
      if (eatRef.current) { eatRef.current.currentTime = 0; eatRef.current.play().catch(() => {}); }
      const newScore = scoreRef.current + POINTS_PER_FOOD;
      setScore(newScore);
      setFood(spawnFood(newSnake));
      if (newScore >= GOAL_SCORE) {
        setSnake(newSnake);
        endGame(true);
        return;
      }
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  }, []);

  const endGame = (won) => {
    setStatus(won ? "victory" : "gameover");
    if (gameoverRef.current && !won) {
      gameoverRef.current.currentTime = 0;
      gameoverRef.current.play().catch(() => {});
    }
    if (ambientRef.current) ambientRef.current.pause();
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem("dwall_snake_high", scoreRef.current.toString());
    }
  };

  useEffect(() => {
    if (status !== "playing") return;
    const speed = Math.max(MIN_SPEED_MS, BASE_SPEED_MS - Math.floor(score / 20) * 8);
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [status, score, tick]);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const d = dirRef.current;
      let nd = null;
      if ((k === "arrowup" || k === "w") && d.y !== 1) nd = { x: 0, y: -1 };
      else if ((k === "arrowdown" || k === "s") && d.y !== -1) nd = { x: 0, y: 1 };
      else if ((k === "arrowleft" || k === "a") && d.x !== 1) nd = { x: -1, y: 0 };
      else if ((k === "arrowright" || k === "d") && d.x !== -1) nd = { x: 1, y: 0 };
      else if (k === " " && status === "playing") { setStatus("paused"); }
      else if (k === " " && status === "paused") { setStatus("playing"); }
      if (nd) {
        setDir(nd);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  const startGame = () => {
    const initSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(initSnake);
    setDir({ x: 1, y: 0 });
    setFood(spawnFood(initSnake));
    setScore(0);
    setMessage("");
    setStatus("playing");
    if (musicOn && ambientRef.current) ambientRef.current.play().catch(() => {});
  };

  const togglePause = () => {
    if (status === "playing") setStatus("paused");
    else if (status === "paused") setStatus("playing");
  };

  const connect = async () => {
    if (!window.ethereum) return setMessage(t("install"));
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    checkClaimed(accounts[0]);
  };

  const checkClaimed = async (addr) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = await getContracts(signer);
      const info = await c.airdrop.getUserAirdropInfo(addr);
      setClaimed(info.hasClaimed);
    } catch (e) { console.error(e); }
  };

  const claimReward = async () => {
    if (!account || claimed) return;
    setClaiming(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = await getContracts(signer);
      const tx = await c.airdrop.claimAirdrop();
      setMessage("Transaction sent: " + tx.hash);
      await tx.wait();
      setMessage(lang === "es" ? "¡Recompensa reclamada! +100 DWALL" : "Reward claimed! +100 DWALL");
      checkClaimed(account);
    } catch (e) {
      setMessage((lang === "es" ? "Error: " : "Claim error: ") + (e.reason || e.message));
    }
    setClaiming(false);
  };

  const toggleMusic = () => {
    setMusicOn(m => !m);
    if (ambientRef.current) {
      if (musicOn) ambientRef.current.pause();
      else if (status === "playing") ambientRef.current.play().catch(() => {});
    }
  };

  const bgStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1a3e 50%, #0a0f1e 100%)',
    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(34,211,238,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(251,191,36,0.08) 0%, transparent 40%), url("/DWALL-Fondo-1080.png")`,
    backgroundSize: '500px auto',
    backgroundRepeat: 'repeat',
    backgroundBlendMode: 'overlay',
    padding: '2rem 1rem',
    color: '#fff'
  };

  const cardStyle = {
    maxWidth: '720px',
    margin: '0 auto',
    background: 'rgba(15, 20, 45, 0.88)',
    borderRadius: '20px',
    border: '1px solid rgba(34, 211, 238, 0.25)',
    padding: '2rem',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.6)'
  };

  return (
    <div style={bgStyle}>
      <audio ref={ambientRef} src="/sounds/ambient.mp3" preload="auto" />
      <audio ref={eatRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={gameoverRef} src="/sounds/wrong.mp3" preload="auto" />

      <div style={cardStyle}>
        <div style={{textAlign:'center',marginBottom:'1rem'}}>
          <h2 style={{
            fontSize:'34px',fontWeight:800,margin:0,
            background:'linear-gradient(135deg, #22d3ee, #fbbf24)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            letterSpacing:'4px'
          }}>{t("title")}</h2>
          <p style={{color:'rgba(255,255,255,0.55)',letterSpacing:'5px',textTransform:'uppercase',fontSize:'12px',marginTop:'6px'}}>
            {t("tagline")}
          </p>
          <button onClick={toggleMusic} style={{
            marginTop:'8px',background:'transparent',border:'1px solid rgba(255,255,255,0.2)',
            color:'#fff',padding:'6px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'12px'
          }}>{musicOn ? t("musicOn") : t("musicOff")}</button>
        </div>

        {!account ? (
          <div style={{textAlign:'center',marginBottom:'1rem'}}>
            <button onClick={connect} style={{
              background:'linear-gradient(135deg,#fbbf24,#f59e0b)',color:'#000',border:'none',
              padding:'12px 28px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'15px'
            }}>{t("connect")}</button>
          </div>
        ) : (
          <div style={{textAlign:'center',marginBottom:'1rem'}}>
            <div style={{display:'inline-block',background:'#4ade80',padding:'6px 14px',borderRadius:'10px',color:'#000',fontSize:'12px',fontWeight:600}}>
              ✓ {t("connected")} {account.slice(0,6)}...{account.slice(-4)}
            </div>
            {claimed && <div style={{marginTop:'6px',color:'#4ade80',fontSize:'12px'}}>{t("claimed")}</div>}
          </div>
        )}

        {status === "idle" && (
          <p style={{textAlign:'center',color:'rgba(255,255,255,0.75)',lineHeight:1.5,marginBottom:'1rem',fontSize:'14px'}}>
            {t("intro")} <b>{GOAL_SCORE}</b> {t("intro2")} <b style={{color:'#fbbf24'}}>100 $DWALL</b>
          </p>
        )}

        <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'8px',marginBottom:'12px'}}>
          <div style={{background:'rgba(0,0,0,0.3)',padding:'8px',borderRadius:'8px',textAlign:'center'}}>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.5)',letterSpacing:'1px'}}>{t("score").toUpperCase()}</div>
            <div style={{fontSize:'18px',fontWeight:700,color:'#22d3ee'}}>{score}</div>
          </div>
          <div style={{background:'rgba(0,0,0,0.3)',padding:'8px',borderRadius:'8px',textAlign:'center'}}>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.5)',letterSpacing:'1px'}}>{t("high").toUpperCase()}</div>
            <div style={{fontSize:'18px',fontWeight:700,color:'#fbbf24'}}>{highScore}</div>
          </div>
          <div style={{background:'rgba(0,0,0,0.3)',padding:'8px',borderRadius:'8px',textAlign:'center'}}>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.5)',letterSpacing:'1px'}}>{t("speed").toUpperCase()}</div>
            <div style={{fontSize:'18px',fontWeight:700,color:'#a78bfa'}}>{Math.floor((BASE_SPEED_MS - Math.max(MIN_SPEED_MS, BASE_SPEED_MS - Math.floor(score / 20) * 8)) / 8) + 1}x</div>
          </div>
          <div style={{background:'rgba(0,0,0,0.3)',padding:'8px',borderRadius:'8px',textAlign:'center'}}>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.5)',letterSpacing:'1px'}}>{t("goal").toUpperCase()}</div>
            <div style={{fontSize:'18px',fontWeight:700,color:'#4ade80'}}>{GOAL_SCORE}</div>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:'1rem'}}>
          <div style={{position:'relative',border:'3px solid #fbbf24',borderRadius:'8px',boxShadow:'0 0 30px rgba(34,211,238,0.3)'}}>
            <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} style={{display:'block'}} />
            {(status === "idle" || status === "paused" || status === "gameover" || status === "victory") && (
              <div style={{
                position:'absolute',inset:0,background:'rgba(10,15,30,0.85)',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                borderRadius:'6px'
              }}>
                {status === "gameover" && (
                  <div style={{fontSize:'32px',fontWeight:900,color:'#f87171',marginBottom:'12px'}}>{t("gameOver")}</div>
                )}
                {status === "victory" && (
                  <>
                    <div style={{fontSize:'28px',fontWeight:900,color:'#fbbf24',marginBottom:'6px'}}>{t("victory")}</div>
                    <div style={{fontSize:'13px',color:'rgba(255,255,255,0.7)',marginBottom:'12px',textAlign:'center',padding:'0 20px'}}>{t("victorySub")}</div>
                  </>
                )}
                {status === "paused" && (
                  <div style={{fontSize:'28px',fontWeight:900,color:'#fbbf24',marginBottom:'12px'}}>⏸</div>
                )}
                {(status === "idle" || status === "gameover") && (
                  <button onClick={startGame} style={{
                    background:'#22d3ee',color:'#000',border:'none',padding:'12px 28px',
                    borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'15px'
                  }}>{status === "idle" ? t("start") : t("restart")}</button>
                )}
                {status === "paused" && (
                  <button onClick={togglePause} style={{
                    background:'#22d3ee',color:'#000',border:'none',padding:'12px 28px',
                    borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'15px'
                  }}>{t("resume")}</button>
                )}
                {status === "victory" && account && !claimed && (
                  <button onClick={claimReward} disabled={claiming} style={{
                    background:'#4ade80',color:'#000',border:'none',padding:'12px 28px',
                    borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'15px'
                  }}>{claiming ? t("claiming") : t("claim")}</button>
                )}
                {status === "victory" && claimed && (
                  <p style={{color:'#fbbf24',fontSize:'13px',marginTop:'6px'}}>{t("alreadyClaimed")}</p>
                )}
                {status === "victory" && !account && (
                  <p style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',marginTop:'6px'}}>{t("connectToClaim")}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{textAlign:'center',marginBottom:'10px'}}>
          <div style={{fontSize:'12px',color:'rgba(255,255,255,0.55)',marginBottom:'8px'}}>{t("controls")}</div>
          {status === "playing" && (
            <button onClick={togglePause} style={{
              background:'transparent',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',
              padding:'6px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'12px'
            }}>{t("pause")}</button>
          )}
        </div>

        {message && (
          <p style={{marginTop:'0.5rem',color:'#fbbf24',wordBreak:'break-all',fontSize:'12px',textAlign:'center'}}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
