import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { getContracts } from "../../utils/web3";
import { useLang } from "../../i18n/LanguageContext";

const LEVELS = [
  {
    id: 0,
    name: { en: "Awakening", es: "Despertar" },
    subtitle: { en: "Money, Inflation & Central Banks", es: "Dinero, inflación y bancos centrales" },
    color: "#4ade80",
    questions: [
      {
        q: {
          en: "What is the main cause of long-term fiat currency inflation?",
          es: "¿Cuál es la causa principal de la inflación del dinero fiat a largo plazo?"
        },
        options: [
          { en: "Population growth", es: "El crecimiento de la población" },
          { en: "Continuous expansion of the money supply by central banks", es: "La expansión continua de la oferta monetaria por parte de los bancos centrales" },
          { en: "Global warming", es: "El calentamiento global" },
          { en: "Increase in labor productivity", es: "El aumento de la productividad laboral" }
        ],
        correct: 1
      },
      {
        q: {
          en: "Who decides how much fiat money is printed?",
          es: "¿Quién decide cuánto dinero fiat se imprime?"
        },
        options: [
          { en: "Elected citizens", es: "Los ciudadanos votantes" },
          { en: "Central banks and monetary authorities", es: "Los bancos centrales y las autoridades monetarias" },
          { en: "Private companies", es: "Las empresas privadas" },
          { en: "The UN", es: "La ONU" }
        ],
        correct: 1
      },
      {
        q: {
          en: "What is the loss of purchasing power over time called?",
          es: "¿Cómo se llama la pérdida de poder adquisitivo a lo largo del tiempo?"
        },
        options: [
          { en: "Deflation", es: "Deflación" },
          { en: "Inflation", es: "Inflación" },
          { en: "Stagflation", es: "Estanflación" },
          { en: "Devaluation", es: "Devaluación" }
        ],
        correct: 1
      },
      {
        q: {
          en: "Which of these is NOT a property of sound money historically?",
          es: "¿Cuál de estas NO es una propiedad histórica del dinero sólido?"
        },
        options: [
          { en: "Scarcity", es: "Escasez" },
          { en: "Durability", es: "Durabilidad" },
          { en: "Unlimited supply on demand", es: "Oferta ilimitada bajo demanda" },
          { en: "Divisibility", es: "Divisibilidad" }
        ],
        correct: 2
      },
      {
        q: {
          en: "What year did the US dollar fully abandon the gold standard?",
          es: "¿En qué año abandonó definitivamente el dólar estadounidense el patrón oro?"
        },
        options: [
          { en: "1913", es: "1913" },
          { en: "1945", es: "1945" },
          { en: "1971", es: "1971" },
          { en: "2008", es: "2008" }
        ],
        correct: 2
      }
    ]
  },
  {
    id: 1,
    name: { en: "Genesis", es: "Génesis" },
    subtitle: { en: "Bitcoin & Ethereum Origins", es: "Orígenes de Bitcoin y Ethereum" },
    color: "#22d3ee",
    questions: [
      {
        q: { en: "Who published the Bitcoin whitepaper?", es: "¿Quién publicó el whitepaper de Bitcoin?" },
        options: [
          { en: "Vitalik Buterin", es: "Vitalik Buterin" },
          { en: "Satoshi Nakamoto", es: "Satoshi Nakamoto" },
          { en: "Hal Finney", es: "Hal Finney" },
          { en: "Nick Szabo", es: "Nick Szabo" }
        ],
        correct: 1
      },
      {
        q: { en: "What year was the Bitcoin genesis block mined?", es: "¿En qué año se minó el bloque génesis de Bitcoin?" },
        options: [
          { en: "2008", es: "2008" },
          { en: "2009", es: "2009" },
          { en: "2010", es: "2010" },
          { en: "2011", es: "2011" }
        ],
        correct: 1
      },
      {
        q: { en: "What is Bitcoin's maximum total supply?", es: "¿Cuál es la oferta máxima total de Bitcoin?" },
        options: [
          { en: "18 million", es: "18 millones" },
          { en: "21 million", es: "21 millones" },
          { en: "100 million", es: "100 millones" },
          { en: "Unlimited", es: "Ilimitada" }
        ],
        correct: 1
      },
      {
        q: {
          en: "What key innovation did Ethereum introduce?",
          es: "¿Qué innovación clave introdujo Ethereum?"
        },
        options: [
          { en: "Proof of Work", es: "Proof of Work" },
          { en: "Smart contracts and a Turing-complete VM", es: "Smart contracts y una VM Turing completa" },
          { en: "Physical mining", es: "Minería física" },
          { en: "Anonymous accounts", es: "Cuentas anónimas" }
        ],
        correct: 1
      },
      {
        q: {
          en: "Ethereum's original consensus mechanism was...",
          es: "El mecanismo de consenso original de Ethereum era..."
        },
        options: [
          { en: "Proof of Stake from day one", es: "Proof of Stake desde el primer día" },
          { en: "Proof of Work, later switched to PoS", es: "Proof of Work, después migrado a PoS" },
          { en: "Delegated Proof of Stake", es: "Delegated Proof of Stake" },
          { en: "Proof of Authority", es: "Proof of Authority" }
        ],
        correct: 1
      }
    ]
  },
  {
    id: 2,
    name: { en: "DeFi Basics", es: "Fundamentos DeFi" },
    subtitle: { en: "Smart Contracts & Tokenomics", es: "Smart contracts y tokenomics" },
    color: "#fbbf24",
    questions: [
      {
        q: { en: "What is a smart contract?", es: "¿Qué es un smart contract?" },
        options: [
          { en: "A legal contract signed with a stylus", es: "Un contrato legal firmado con lápiz digital" },
          { en: "A self-executing program on the blockchain", es: "Un programa autoejecutable en la blockchain" },
          { en: "A DeFi trading strategy", es: "Una estrategia de trading en DeFi" },
          { en: "A hardware wallet", es: "Una hardware wallet" }
        ],
        correct: 1
      },
      {
        q: { en: "What does DEX stand for?", es: "¿Qué significa DEX?" },
        options: [
          { en: "Digital Exchange", es: "Digital Exchange" },
          { en: "Decentralized Exchange", es: "Decentralized Exchange" },
          { en: "Direct Exchange", es: "Direct Exchange" },
          { en: "Distributed Exchange", es: "Distributed Exchange" }
        ],
        correct: 1
      },
      {
        q: { en: "What is 'yield farming'?", es: "¿Qué es el 'yield farming'?" },
        options: [
          { en: "Physical agriculture", es: "Agricultura física" },
          { en: "Providing liquidity/staking to earn rewards", es: "Aportar liquidez/staking para ganar recompensas" },
          { en: "Buying and holding tokens", es: "Comprar y hodlear tokens" },
          { en: "Mining cryptocurrencies", es: "Minar criptomonedas" }
        ],
        correct: 1
      },
      {
        q: { en: "What does 'tokenomics' refer to?", es: "¿A qué se refiere 'tokenomics'?" },
        options: [
          { en: "Analyzing traditional stocks", es: "Análisis de acciones tradicionales" },
          { en: "A token's economic design: supply, distribution, incentives", es: "El diseño económico de un token: oferta, distribución, incentivos" },
          { en: "Trading NFTs", es: "Trading de NFTs" },
          { en: "Blockchain security", es: "Seguridad blockchain" }
        ],
        correct: 1
      },
      {
        q: { en: "Which of these is NOT a legitimate DeFi risk?", es: "¿Cuál de estos NO es un riesgo legítimo en DeFi?" },
        options: [
          { en: "Impermanent loss", es: "Pérdida impermanente" },
          { en: "Smart contract bugs", es: "Bugs en smart contracts" },
          { en: "Rugpulls", es: "Rugpulls" },
          { en: "The blockchain running out of gas globally", es: "Que la blockchain se quede sin gas globalmente" }
        ],
        correct: 3
      }
    ]
  },
  {
    id: 3,
    name: { en: "DiamondWall", es: "DiamondWall" },
    subtitle: { en: "The Ecosystem", es: "El ecosistema" },
    color: "#a78bfa",
    questions: [
      {
        q: { en: "On which blockchain is DiamondWall ($DWALL) deployed?", es: "¿En qué blockchain está desplegado DiamondWall ($DWALL)?" },
        options: [
          { en: "Ethereum", es: "Ethereum" },
          { en: "Binance Smart Chain (BSC)", es: "Binance Smart Chain (BSC)" },
          { en: "Solana", es: "Solana" },
          { en: "Polygon", es: "Polygon" }
        ],
        correct: 1
      },
      {
        q: { en: "What type of yield does DiamondWall generate?", es: "¿Qué tipo de rendimiento genera DiamondWall?" },
        options: [
          { en: "Inflationary token emissions", es: "Emisiones inflacionarias de tokens" },
          { en: "Real yield from Venus and PancakeSwap", es: "Rendimiento real de Venus y PancakeSwap" },
          { en: "Fiat interest", es: "Interés fiat" },
          { en: "Ponzi-style compounding", es: "Compounding tipo ponzi" }
        ],
        correct: 1
      },
      {
        q: { en: "How many audited smart contracts make up the ecosystem?", es: "¿Cuántos smart contracts auditados componen el ecosistema?" },
        options: [
          { en: "3", es: "3" },
          { en: "5", es: "5" },
          { en: "8", es: "8" },
          { en: "12", es: "12" }
        ],
        correct: 2
      },
      {
        q: {
          en: "What percentage of total supply is allocated to the community airdrop?",
          es: "¿Qué porcentaje del supply total se destina al airdrop comunitario?"
        },
        options: [
          { en: "5%", es: "5%" },
          { en: "10%", es: "10%" },
          { en: "15%", es: "15%" },
          { en: "25%", es: "25%" }
        ],
        correct: 2
      },
      {
        q: { en: "What is DiamondWall's audit coverage percentage?", es: "¿Cuál es el porcentaje de cobertura de auditoría de DiamondWall?" },
        options: [
          { en: "50%", es: "50%" },
          { en: "72.4%", es: "72,4%" },
          { en: "85%", es: "85%" },
          { en: "92.31%", es: "92,31%" }
        ],
        correct: 3
      }
    ]
  },
  {
    id: 4,
    name: { en: "Master", es: "Maestría" },
    subtitle: { en: "Monetary Philosophy & the Future", es: "Filosofía monetaria y el futuro" },
    color: "#f472b6",
    questions: [
      {
        q: { en: "What defines truly decentralized money?", es: "¿Qué define al dinero realmente descentralizado?" },
        options: [
          { en: "Being issued by a state", es: "Ser emitido por un Estado" },
          { en: "No single entity can censor, freeze, or dilute it", es: "Que ninguna entidad pueda censurarlo, congelarlo ni diluirlo" },
          { en: "Being traded on many exchanges", es: "Cotizar en muchos exchanges" },
          { en: "Having a popular logo", es: "Tener un logo popular" }
        ],
        correct: 1
      },
      {
        q: { en: "What is the difference between a CBDC and Bitcoin?", es: "¿Cuál es la diferencia entre una CBDC y Bitcoin?" },
        options: [
          { en: "CBDCs are decentralized, Bitcoin is not", es: "Las CBDC son descentralizadas, Bitcoin no" },
          { en: "CBDCs are state-controlled, Bitcoin is permissionless", es: "Las CBDC están controladas por el Estado, Bitcoin es sin permiso" },
          { en: "There is no difference", es: "No hay diferencia" },
          { en: "Bitcoin is only for governments", es: "Bitcoin es solo para gobiernos" }
        ],
        correct: 1
      },
      {
        q: { en: "What does 'permissionless' mean in Web3?", es: "¿Qué significa 'sin permiso' (permissionless) en Web3?" },
        options: [
          { en: "You need approval from a bank", es: "Necesitas aprobación de un banco" },
          { en: "Anyone can participate without needing authorization", es: "Cualquiera puede participar sin necesitar autorización" },
          { en: "Only whitelisted users can operate", es: "Solo pueden operar usuarios en whitelist" },
          { en: "Requires KYC to move funds", es: "Requiere KYC para mover fondos" }
        ],
        correct: 1
      },
      {
        q: { en: "Why is on-chain transparency important?", es: "¿Por qué es importante la transparencia on-chain?" },
        options: [
          { en: "It makes the network slower", es: "Hace la red más lenta" },
          { en: "Any user can verify balances, transactions, and contract logic", es: "Cualquier usuario puede verificar balances, transacciones y lógica de contratos" },
          { en: "It exposes the founder's private data", es: "Expone los datos privados del fundador" },
          { en: "It is only decorative", es: "Solo es decorativa" }
        ],
        correct: 1
      },
      {
        q: { en: "What is the deepest promise of DeFi?", es: "¿Cuál es la promesa más profunda de DeFi?" },
        options: [
          { en: "Making the founders rich", es: "Enriquecer a los fundadores" },
          { en: "Building a financial system with rules verifiable by all", es: "Construir un sistema financiero con reglas verificables por todos" },
          { en: "Replacing bank apps", es: "Sustituir las apps de los bancos" },
          { en: "Eliminating all financial risk", es: "Eliminar todo el riesgo financiero" }
        ],
        correct: 1
      }
    ]
  }
];

const T = {
  title: { en: "THE DIAMOND PATH", es: "EL CAMINO DIAMANTE" },
  tagline: { en: "Learn. Prove. Earn.", es: "Aprende. Demuestra. Gana." },
  musicOn: { en: "🎵 Music On", es: "🎵 Música on" },
  musicOff: { en: "🔇 Music Off", es: "🔇 Música off" },
  connect: { en: "Connect Wallet", es: "Conectar wallet" },
  connected: { en: "Connected:", es: "Conectada:" },
  claimed: { en: "✓ Airdrop already claimed", es: "✓ Airdrop ya reclamado" },
  intro: {
    en: "5 levels. 5 questions each. Answer at least",
    es: "5 niveles. 5 preguntas por nivel. Acierta al menos"
  },
  intro2: {
    en: "correctly to master a level. Complete any level and unlock your on-chain reward:",
    es: "para dominar un nivel. Supera cualquier nivel y desbloquea tu recompensa on-chain:"
  },
  level: { en: "LEVEL", es: "NIVEL" },
  question: { en: "Question", es: "Pregunta" },
  of: { en: "of", es: "de" },
  score: { en: "Score:", es: "Aciertos:" },
  correct: { en: "✓ Correct!", es: "✓ ¡Correcto!" },
  incorrect: { en: "✗ Incorrect", es: "✗ Incorrecto" },
  result: { en: "Result", es: "Resultado" },
  mastered: { en: "🏆 Level mastered!", es: "🏆 ¡Nivel dominado!" },
  claim: { en: "Claim 100 DWALL", es: "Reclamar 100 DWALL" },
  claiming: { en: "Claiming...", es: "Reclamando..." },
  alreadyClaimed: { en: "You've already claimed this airdrop.", es: "Ya has reclamado este airdrop." },
  connectToClaim: { en: "Connect your wallet to claim.", es: "Conecta tu wallet para reclamar." },
  needScore: { en: "Need at least 4/5 to master this level. Try again!", es: "Necesitas al menos 4/5 para dominar el nivel. ¡Inténtalo de nuevo!" },
  retry: { en: "Retry", es: "Reintentar" },
  levels: { en: "Levels", es: "Niveles" },
  install: { en: "Install MetaMask", es: "Instala MetaMask" }
};

export default function Quiz() {
  const { lang } = useLang();
  const [step, setStep] = useState("intro");
  const [levelIdx, setLevelIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [account, setAccount] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [musicOn, setMusicOn] = useState(true);
  const ambientRef = useRef(null);
  const correctRef = useRef(null);
  const wrongRef = useRef(null);

  const t = (key) => T[key][lang] || T[key].en;
  const tt = (obj) => (obj && obj[lang]) || (obj && obj.en) || "";

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = 0.15;
      ambientRef.current.loop = true;
    }
  }, []);

  const level = LEVELS[levelIdx];
  const question = level?.questions[qIdx];

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

  const startLevel = (i) => {
    setLevelIdx(i);
    setQIdx(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setStep("playing");
    setMessage("");
    if (musicOn && ambientRef.current) {
      ambientRef.current.play().catch(() => {});
    }
  };

  const answer = (optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === question.correct;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setScore(s => s + 1);
      if (correctRef.current) { correctRef.current.currentTime = 0; correctRef.current.play().catch(() => {}); }
    } else {
      if (wrongRef.current) { wrongRef.current.currentTime = 0; wrongRef.current.play().catch(() => {}); }
    }
    setTimeout(() => {
      if (qIdx + 1 < level.questions.length) {
        setQIdx(qIdx + 1);
        setSelected(null);
        setFeedback(null);
      } else {
        setStep("result");
      }
    }, 1400);
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
      else ambientRef.current.play().catch(() => {});
    }
  };

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 500);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 500);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const bgStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1a3e 50%, #0a0f1e 100%)',
    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(34,211,238,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(251,191,36,0.08) 0%, transparent 40%), url("/DWALL-Fondo-1080.png")`,
    backgroundSize: '500px auto',
    backgroundRepeat: 'repeat',
    backgroundBlendMode: 'overlay',
    padding: isMobile ? '1rem 0.5rem' : '2rem 1rem',
    color: '#fff'
  };

  const cardStyle = {
    maxWidth: '760px',
    margin: '0 auto',
    background: 'rgba(15, 20, 45, 0.88)',
    borderRadius: isMobile ? '14px' : '20px',
    border: '1px solid rgba(251, 191, 36, 0.25)',
    padding: isMobile ? '1.2rem' : '2rem',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.6)'
  };

  return (
    <div style={bgStyle}>
      <audio ref={ambientRef} src="/sounds/ambient.mp3" preload="auto" />
      <audio ref={correctRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongRef} src="/sounds/wrong.mp3" preload="auto" />

      <div style={cardStyle}>
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <h2 style={{
            fontSize:'34px',fontWeight:800,margin:0,
            background:'linear-gradient(135deg, #22d3ee, #a78bfa, #fbbf24)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            letterSpacing:'4px'
          }}>{t("title")}</h2>
          <p style={{color:'rgba(255,255,255,0.55)',letterSpacing:'5px',textTransform:'uppercase',fontSize:'12px',marginTop:'6px'}}>
            {t("tagline")}
          </p>
          <button onClick={toggleMusic} style={{
            marginTop:'10px',background:'transparent',border:'1px solid rgba(255,255,255,0.2)',
            color:'#fff',padding:'6px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'12px'
          }}>{musicOn ? t("musicOn") : t("musicOff")}</button>
        </div>

        {!account ? (
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <button onClick={connect} style={{
              background:'linear-gradient(135deg,#fbbf24,#f59e0b)',color:'#000',border:'none',
              padding:'14px 32px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'16px'
            }}>{t("connect")}</button>
          </div>
        ) : (
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{display:'inline-block',background:'#4ade80',padding:'8px 16px',borderRadius:'10px',color:'#000',fontSize:'13px',fontWeight:600}}>
              ✓ {t("connected")} {account.slice(0,6)}...{account.slice(-4)}
            </div>
            {claimed && <div style={{marginTop:'8px',color:'#4ade80',fontSize:'13px'}}>{t("claimed")}</div>}
          </div>
        )}

        {step === "intro" && (
          <div>
            <p style={{textAlign:'center',color:'rgba(255,255,255,0.75)',lineHeight:1.6,marginBottom:'1.5rem'}}>
              {t("intro")} <b>4/5</b> {t("intro2")} <b style={{color:'#fbbf24'}}>100 $DWALL</b>.
            </p>
            <div style={{display:'grid',gap:'10px'}}>
              {LEVELS.map((l, i) => (
                <button key={l.id} onClick={() => startLevel(i)} style={{
                  background:'rgba(0,0,0,0.35)',color:'#fff',border:`2px solid ${l.color}`,
                  padding:'14px 18px',borderRadius:'10px',textAlign:'left',cursor:'pointer'
                }}>
                  <div style={{fontSize:'11px',color:l.color,letterSpacing:'2px',fontWeight:700}}>{t("level")} {i+1}</div>
                  <div style={{fontSize:'18px',fontWeight:700,marginTop:'4px'}}>{tt(l.name)}</div>
                  <div style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',marginTop:'2px'}}>{tt(l.subtitle)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "playing" && question && (
          <div>
            <div style={{textAlign:'center',marginBottom:'1rem'}}>
              <div style={{fontSize:'12px',color:level.color,letterSpacing:'3px',fontWeight:700}}>
                {t("level")} {levelIdx+1} · {tt(level.name).toUpperCase()}
              </div>
              <div style={{fontSize:'13px',color:'rgba(255,255,255,0.55)',marginTop:'4px'}}>
                {t("question")} {qIdx+1} {t("of")} {level.questions.length}  ·  {t("score")} {score}/{level.questions.length}
              </div>
            </div>
            <h3 style={{fontSize:'22px',fontWeight:700,margin:'1.5rem 0',textAlign:'center',lineHeight:1.4}}>
              {tt(question.q)}
            </h3>
            <div style={{display:'grid',gap:'10px'}}>
              {question.options.map((opt, i) => {
                let bg = 'rgba(0,0,0,0.4)';
                let border = 'rgba(255,255,255,0.15)';
                if (selected !== null) {
                  if (i === question.correct) { bg = 'rgba(74,222,128,0.25)'; border = '#4ade80'; }
                  else if (i === selected) { bg = 'rgba(248,113,113,0.25)'; border = '#f87171'; }
                }
                return (
                  <button key={i} onClick={() => answer(i)} disabled={selected !== null} style={{
                    background:bg,color:'#fff',border:`1px solid ${border}`,
                    padding:'14px 18px',borderRadius:'10px',textAlign:'left',
                    cursor: selected === null ? 'pointer' : 'default',fontSize:'15px'
                  }}>{tt(opt)}</button>
                );
              })}
            </div>
            {feedback && (
              <div style={{
                textAlign:'center',marginTop:'1rem',fontSize:'18px',fontWeight:700,
                color: feedback === 'correct' ? '#4ade80' : '#f87171'
              }}>
                {feedback === 'correct' ? t("correct") : t("incorrect")}
              </div>
            )}
          </div>
        )}

        {step === "result" && (
          <div style={{textAlign:'center'}}>
            <h3 style={{fontSize:'26px',fontWeight:800,color:level.color,marginBottom:'0.5rem'}}>
              {tt(level.name)} — {t("result")}
            </h3>
            <div style={{fontSize:'48px',fontWeight:900,margin:'1rem 0',color:'#fbbf24'}}>
              {score} / {level.questions.length}
            </div>
            {score >= 4 ? (
              <div>
                <p style={{color:'#4ade80',fontSize:'18px',fontWeight:700,marginBottom:'1rem'}}>
                  {t("mastered")}
                </p>
                {account && !claimed && (
                  <button onClick={claimReward} disabled={claiming} style={{
                    background:'#4ade80',color:'#000',border:'none',padding:'14px 32px',
                    borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'16px',marginTop:'10px'
                  }}>{claiming ? t("claiming") : t("claim")}</button>
                )}
                {claimed && <p style={{color:'#fbbf24',marginTop:'10px'}}>{t("alreadyClaimed")}</p>}
                {!account && <p style={{color:'rgba(255,255,255,0.6)',marginTop:'10px'}}>{t("connectToClaim")}</p>}
              </div>
            ) : (
              <p style={{color:'#f87171',fontSize:'16px'}}>
                {t("needScore")}
              </p>
            )}
            {message && (
              <p style={{marginTop:'1rem',color:'#fbbf24',wordBreak:'break-all',fontSize:'13px'}}>
                {message}
              </p>
            )}
            <div style={{marginTop:'1.5rem',display:'flex',gap:'10px',justifyContent:'center'}}>
              <button onClick={() => startLevel(levelIdx)} style={{
                background:'transparent',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',
                padding:'10px 20px',borderRadius:'8px',cursor:'pointer'
              }}>{t("retry")}</button>
              <button onClick={() => setStep("intro")} style={{
                background:'transparent',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',
                padding:'10px 20px',borderRadius:'8px',cursor:'pointer'
              }}>{t("levels")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
