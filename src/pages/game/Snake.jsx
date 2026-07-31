import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { getContracts } from "../../utils/web3";
import { useLang } from "../../i18n/LanguageContext";

const GRID = 20;
const GOAL = 200;
const POINTS = 10;

const DIFFICULTIES = [
  { id: 0, name: { es: "Rookie", en: "Rookie" }, baseSpeed: 260, color: "#4ade80" },
  { id: 1, name: { es: "Fácil", en: "Easy" }, baseSpeed: 220, color: "#22d3ee" },
  { id: 2, name: { es: "Medio", en: "Medium" }, baseSpeed: 180, color: "#fbbf24" },
  { id: 3, name: { es: "Difícil", en: "Hard" }, baseSpeed: 130, color: "#a78bfa" },
  { id: 4, name: { es: "Extremo", en: "Extreme" }, baseSpeed: 90, color: "#f472b6" }
];

export default function Snake() {
  const { lang } = useLang();
  const es = lang === "es";
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const dirRef = useRef({ x: 1, y: 0 });
  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    food: { x: 15, y: 10 },
    score: 0,
    playing: false
  });

  const [cell, setCell] = useState(typeof window !== "undefined" && window.innerWidth < 500 ? 16 : 22);
  const CANVAS = GRID * cell;
  const [difficulty, setDifficulty] = useState(1);
  const [status, setStatus] = useState("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [account, setAccount] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("dwall_snake_high");
    if (s) setHighScore(parseInt(s));
    const onResize = () => setCell(window.innerWidth < 500 ? 16 : 22);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const spawnFood = (snake) => {
    let f;
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some(s => s.x === f.x && s.y === f.y));
    return f;
  };

  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, CANVAS, CANVAS);

    ctx.strokeStyle = "rgba(74,222,128,0.18)";
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, CANVAS);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(CANVAS, i * cell);
      ctx.stroke();
    }

    const f = gameRef.current.food;
    const fx = f.x * cell + cell / 2;
    const fy = f.y * cell + cell / 2;
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(fx, fy - cell / 2 + 3);
    ctx.lineTo(fx + cell / 2 - 3, fy);
    ctx.lineTo(fx, fy + cell / 2 - 3);
    ctx.lineTo(fx - cell / 2 + 3, fy);
    ctx.closePath();
    ctx.fill();

    gameRef.current.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#00ff41" : `rgba(0,255,65,${Math.max(0.4, 1 - i * 0.05)})`;
      ctx.fillRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2);
    });
  };

  const tick = () => {
    const g = gameRef.current;
    if (!g.playing) return;
    const d = dirRef.current;
    const head = g.snake[0];
    const newHead = { x: head.x + d.x, y: head.y + d.y };

    if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
      g.playing = false;
      endGame(false);
      return;
    }
    if (g.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      g.playing = false;
      endGame(false);
      return;
    }

    const newSnake = [newHead, ...g.snake];
    if (newHead.x === g.food.x && newHead.y === g.food.y) {
      g.score += POINTS;
      setScore(g.score);
      g.food = spawnFood(newSnake);
      g.snake = newSnake;
      if (g.score >= GOAL) {
        g.playing = false;
        draw();
        endGame(true);
        return;
      }
    } else {
      newSnake.pop();
      g.snake = newSnake;
    }
    draw();
  };

  const endGame = (won) => {
    if (audioRef.current) audioRef.current.pause();
    setStatus(won ? "victory" : "gameover");
    const g = gameRef.current;
    if (g.score > highScore) {
      setHighScore(g.score);
      localStorage.setItem("dwall_snake_high", g.score.toString());
    }
  };

  useEffect(() => { draw(); }, [cell]);

  useEffect(() => {
    if (status !== "playing") return;
    const base = DIFFICULTIES[difficulty].baseSpeed;
    const speed = Math.max(60, base - Math.floor(score / 40) * 10);
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [status, score, difficulty]);

  const changeDir = (nd) => {
    const d = dirRef.current;
    if (nd.x === -d.x && nd.y === -d.y) return;
    if (nd.x !== 0 && d.x !== 0) return;
    if (nd.y !== 0 && d.y !== 0) return;
    dirRef.current = nd;
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") { changeDir({ x: 0, y: -1 }); e.preventDefault(); }
      else if (k === "arrowdown" || k === "s") { changeDir({ x: 0, y: 1 }); e.preventDefault(); }
      else if (k === "arrowleft" || k === "a") { changeDir({ x: -1, y: 0 }); e.preventDefault(); }
      else if (k === "arrowright" || k === "d") { changeDir({ x: 1, y: 0 }); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const startGame = () => {
    const initSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    gameRef.current = { snake: initSnake, food: spawnFood(initSnake), score: 0, playing: true };
    dirRef.current = { x: 1, y: 0 };
    setScore(0);
    setMessage("");
    setStatus("playing");
    draw();
    if (musicOn && audioRef.current) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMusic = () => {
    setMusicOn(m => !m);
    if (audioRef.current) {
      if (musicOn) audioRef.current.pause();
      else if (status === "playing") audioRef.current.play().catch(() => {});
    }
  };

  const connect = async () => {
    if (!window.ethereum) return setMessage(es ? "Instala MetaMask" : "Install MetaMask");
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
      setMessage((es ? "Tx enviada: " : "Tx sent: ") + tx.hash);
      await tx.wait();
      setMessage(es ? "¡Recompensa reclamada! +100 DWALL" : "Reward claimed! +100 DWALL");
      checkClaimed(account);
    } catch (e) {
      setMessage("Error: " + (e.reason || e.message));
    }
    setClaiming(false);
  };

  const btnStyle = {
    background: 'rgba(0,255,65,0.15)',
    border: '2px solid rgba(0,255,65,0.5)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '32px',
    cursor: 'pointer',
    touchAction: 'none',
    userSelect: 'none'
  };

  return (
    <>
    <audio ref={audioRef} src="/sounds/snake_ambient.mp3" loop preload="auto" />
    <div style={{minHeight:'100vh',padding:'1rem 0.5rem',color:'#fff',background:'linear-gradient(135deg,#0a0f1e,#1a1a3e,#0a0f1e)'}}>
      <div style={{maxWidth:'720px',margin:'0 auto',background:'rgba(15,20,45,0.9)',borderRadius:'20px',border:'1px solid rgba(0,255,65,0.3)',padding:'1.5rem 1rem'}}>
        <div style={{textAlign:'center',marginBottom:'1rem'}}>
          <h2 style={{fontSize:'clamp(24px,6vw,34px)',fontWeight:800,margin:0,color:'#00ff41',letterSpacing:'4px'}}>DIAMONDSNAKE</h2>
          <p style={{color:'rgba(255,255,255,0.55)',letterSpacing:'5px',textTransform:'uppercase',fontSize:'11px'}}>
            {es ? "Come. Crece. Gana." : "Eat. Grow. Earn."}
          </p>
          <button onClick={toggleMusic} style={{marginTop:'8px',background:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'#fff',padding:'6px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'12px'}}>
            {musicOn ? (es ? "🎵 Música on" : "🎵 Music On") : (es ? "🔇 Música off" : "🔇 Music Off")}
          </button>
        </div>

        {!account ? (
          <div style={{textAlign:'center',marginBottom:'1rem'}}>
            <button onClick={connect} style={{background:'#fbbf24',color:'#000',border:'none',padding:'12px 28px',borderRadius:'10px',fontWeight:700,cursor:'pointer'}}>
              {es ? "Conectar wallet" : "Connect Wallet"}
            </button>
          </div>
        ) : (
          <div style={{textAlign:'center',marginBottom:'1rem'}}>
            <div style={{display:'inline-block',background:'#4ade80',padding:'6px 14px',borderRadius:'10px',color:'#000',fontSize:'12px',fontWeight:600}}>
              ✓ {account.slice(0,6)}...{account.slice(-4)}
            </div>
            {claimed && <div style={{marginTop:'6px',color:'#4ade80',fontSize:'12px'}}>{es ? "✓ Airdrop ya reclamado" : "✓ Airdrop already claimed"}</div>}
          </div>
        )}

        <div style={{display:'flex',gap:'6px',justifyContent:'center',marginBottom:'12px',flexWrap:'wrap'}}>
          {DIFFICULTIES.map(d => (
            <button key={d.id}
              onClick={() => status !== 'playing' && setDifficulty(d.id)}
              disabled={status === 'playing'}
              style={{
                background: difficulty === d.id ? d.color : 'rgba(0,0,0,0.35)',
                color: difficulty === d.id ? '#000' : '#fff',
                border: `1px solid ${d.color}`,
                padding: '6px 12px', borderRadius: '8px',
                cursor: status === 'playing' ? 'not-allowed' : 'pointer',
                fontSize: '12px', fontWeight: 600,
                opacity: status === 'playing' && difficulty !== d.id ? 0.4 : 1
              }}>{es ? d.name.es : d.name.en}</button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'12px'}}>
          <div style={{background:'rgba(0,0,0,0.3)',padding:'6px',borderRadius:'8px',textAlign:'center'}}>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>{es ? "PUNTOS" : "SCORE"}</div>
            <div style={{fontSize:'16px',fontWeight:700,color:'#00ff41'}}>{score}</div>
          </div>
          <div style={{background:'rgba(0,0,0,0.3)',padding:'6px',borderRadius:'8px',textAlign:'center'}}>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>{es ? "RÉCORD" : "HIGH"}</div>
            <div style={{fontSize:'16px',fontWeight:700,color:'#fbbf24'}}>{highScore}</div>
          </div>
          <div style={{background:'rgba(0,0,0,0.3)',padding:'6px',borderRadius:'8px',textAlign:'center'}}>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>{es ? "NIVEL" : "LEVEL"}</div>
            <div style={{fontSize:'11px',fontWeight:700,color:DIFFICULTIES[difficulty].color}}>{es ? DIFFICULTIES[difficulty].name.es : DIFFICULTIES[difficulty].name.en}</div>
          </div>
          <div style={{background:'rgba(0,0,0,0.3)',padding:'6px',borderRadius:'8px',textAlign:'center'}}>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>{es ? "META" : "GOAL"}</div>
            <div style={{fontSize:'16px',fontWeight:700,color:'#4ade80'}}>{GOAL}</div>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:'1rem'}}>
          <div style={{position:'relative',border:'3px solid #fbbf24',borderRadius:'8px',maxWidth:'100%'}}>
            <canvas ref={canvasRef} width={CANVAS} height={CANVAS} style={{display:'block',maxWidth:'100%'}} />
            {(status === "idle" || status === "gameover" || status === "victory") && (
              <div style={{position:'absolute',inset:0,background:'rgba(10,15,30,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderRadius:'6px',padding:'12px'}}>
                {status === "gameover" && <div style={{fontSize:'28px',fontWeight:900,color:'#f87171',marginBottom:'12px'}}>GAME OVER</div>}
                {status === "victory" && (
                  <>
                    <div style={{fontSize:'24px',fontWeight:900,color:'#fbbf24',marginBottom:'6px'}}>🏆 {es ? "¡VICTORIA!" : "VICTORY!"}</div>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.7)',marginBottom:'12px',textAlign:'center'}}>
                      {es ? "Has alcanzado la meta" : "You reached the goal"}
                    </div>
                  </>
                )}
                {(status === "idle" || status === "gameover") && (
                  <button onClick={startGame} style={{background:'#00ff41',color:'#000',border:'none',padding:'12px 28px',borderRadius:'10px',fontWeight:700,cursor:'pointer'}}>
                    {status === "idle" ? (es ? "▶ Empezar" : "▶ Start") : (es ? "↻ Reiniciar" : "↻ Restart")}
                  </button>
                )}
                {status === "victory" && account && !claimed && (
                  <button onClick={claimReward} disabled={claiming} style={{background:'#4ade80',color:'#000',border:'none',padding:'12px 28px',borderRadius:'10px',fontWeight:700,cursor:'pointer'}}>
                    {claiming ? (es ? "Reclamando..." : "Claiming...") : (es ? "Reclamar 100 DWALL" : "Claim 100 DWALL")}
                  </button>
                )}
                {status === "victory" && !account && (
                  <p style={{color:'rgba(255,255,255,0.6)',fontSize:'13px'}}>{es ? "Conecta tu wallet" : "Connect your wallet"}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{textAlign:'center',marginTop:'10px'}}>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',letterSpacing:'2px',marginBottom:'12px',textTransform:'uppercase'}}>
            {es ? "Controles" : "Controls"}
          </div>
          <div style={{display:'inline-grid',gridTemplateColumns:'repeat(3,70px)',gridTemplateRows:'repeat(3,70px)',gap:'8px'}}>
            <div></div>
            <button onTouchStart={(e)=>{e.preventDefault();changeDir({x:0,y:-1});}} onClick={()=>changeDir({x:0,y:-1})} style={btnStyle}>↑</button>
            <div></div>
            <button onTouchStart={(e)=>{e.preventDefault();changeDir({x:-1,y:0});}} onClick={()=>changeDir({x:-1,y:0})} style={btnStyle}>←</button>
            <div style={{background:'rgba(251,191,36,0.15)',border:'2px solid rgba(251,191,36,0.4)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>💎</div>
            <button onTouchStart={(e)=>{e.preventDefault();changeDir({x:1,y:0});}} onClick={()=>changeDir({x:1,y:0})} style={btnStyle}>→</button>
            <div></div>
            <button onTouchStart={(e)=>{e.preventDefault();changeDir({x:0,y:1});}} onClick={()=>changeDir({x:0,y:1})} style={btnStyle}>↓</button>
            <div></div>
          </div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginTop:'12px'}}>
            {es ? "PC: flechas o WASD  ·  Móvil: pulsa las flechas" : "PC: arrows or WASD  ·  Mobile: tap arrows"}
          </div>
        </div>

        {message && <p style={{marginTop:'0.5rem',color:'#fbbf24',fontSize:'12px',textAlign:'center',wordBreak:'break-all'}}>{message}</p>}
      </div>
    </div>
    </>
  );
}
