import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { getContracts } from "../../utils/web3";

const LEVELS = [
  {
    id: 0,
    name: "Awakening",
    subtitle: "Money, Inflation & Central Banks",
    color: "#4ade80",
    questions: [
      {
        q: "What is the main cause of long-term fiat currency inflation?",
        options: [
          "Population growth",
          "Continuous expansion of the money supply by central banks",
          "Global warming",
          "Increase in labor productivity"
        ],
        correct: 1
      },
      {
        q: "Who decides how much fiat money is printed?",
        options: [
          "Elected citizens",
          "Central banks and monetary authorities",
          "Private companies",
          "The UN"
        ],
        correct: 1
      },
      {
        q: "What is the loss of purchasing power over time called?",
        options: ["Deflation", "Inflation", "Stagflation", "Devaluation"],
        correct: 1
      },
      {
        q: "Which of these is NOT a property of sound money historically?",
        options: [
          "Scarcity",
          "Durability",
          "Unlimited supply on demand",
          "Divisibility"
        ],
        correct: 2
      },
      {
        q: "What year did the US dollar fully abandon the gold standard?",
        options: ["1913", "1945", "1971", "2008"],
        correct: 2
      }
    ]
  },
  {
    id: 1,
    name: "Genesis",
    subtitle: "Bitcoin & Ethereum Origins",
    color: "#22d3ee",
    questions: [
      {
        q: "Who published the Bitcoin whitepaper?",
        options: ["Vitalik Buterin", "Satoshi Nakamoto", "Hal Finney", "Nick Szabo"],
        correct: 1
      },
      {
        q: "What year was the Bitcoin genesis block mined?",
        options: ["2008", "2009", "2010", "2011"],
        correct: 1
      },
      {
        q: "What is Bitcoin's maximum total supply?",
        options: ["18 million", "21 million", "100 million", "Unlimited"],
        correct: 1
      },
      {
        q: "What key innovation did Ethereum introduce?",
        options: [
          "Proof of Work",
          "Smart contracts and a Turing-complete VM",
          "Physical mining",
          "Anonymous accounts"
        ],
        correct: 1
      },
      {
        q: "Ethereum's original consensus mechanism was...",
        options: [
          "Proof of Stake from day one",
          "Proof of Work, later switched to PoS",
          "Delegated Proof of Stake",
          "Proof of Authority"
        ],
        correct: 1
      }
    ]
  },
  {
    id: 2,
    name: "DeFi Basics",
    subtitle: "Smart Contracts & Tokenomics",
    color: "#fbbf24",
    questions: [
      {
        q: "What is a smart contract?",
        options: [
          "A legal contract signed with a stylus",
          "A self-executing program on the blockchain",
          "A DeFi trading strategy",
          "A hardware wallet"
        ],
        correct: 1
      },
      {
        q: "What does DEX stand for?",
        options: [
          "Digital Exchange",
          "Decentralized Exchange",
          "Direct Exchange",
          "Distributed Exchange"
        ],
        correct: 1
      },
      {
        q: "What is 'yield farming'?",
        options: [
          "Physical agriculture",
          "Providing liquidity/staking to earn rewards",
          "Buying and holding tokens",
          "Mining cryptocurrencies"
        ],
        correct: 1
      },
      {
        q: "What does 'tokenomics' refer to?",
        options: [
          "Analyzing traditional stocks",
          "A token's economic design: supply, distribution, incentives",
          "Trading NFTs",
          "Blockchain security"
        ],
        correct: 1
      },
      {
        q: "Which of these is NOT a legitimate DeFi risk?",
        options: [
          "Impermanent loss",
          "Smart contract bugs",
          "Rugpulls",
          "The blockchain running out of gas globally"
        ],
        correct: 3
      }
    ]
  },
  {
    id: 3,
    name: "DiamondWall",
    subtitle: "The Ecosystem",
    color: "#a78bfa",
    questions: [
      {
        q: "On which blockchain is DiamondWall ($DWALL) deployed?",
        options: ["Ethereum", "Binance Smart Chain (BSC)", "Solana", "Polygon"],
        correct: 1
      },
      {
        q: "What type of yield does DiamondWall generate?",
        options: [
          "Inflationary token emissions",
          "Real yield from Venus and PancakeSwap",
          "Fiat interest",
          "Ponzi-style compounding"
        ],
        correct: 1
      },
      {
        q: "How many audited smart contracts make up the ecosystem?",
        options: ["3", "5", "8", "12"],
        correct: 2
      },
      {
        q: "What percentage of total supply is allocated to the community airdrop?",
        options: ["5%", "10%", "15%", "25%"],
        correct: 2
      },
      {
        q: "What is DiamondWall's audit coverage percentage?",
        options: ["50%", "72.4%", "85%", "92.31%"],
        correct: 3
      }
    ]
  },
  {
    id: 4,
    name: "Master",
    subtitle: "Monetary Philosophy & the Future",
    color: "#f472b6",
    questions: [
      {
        q: "What defines truly decentralized money?",
        options: [
          "Being issued by a state",
          "No single entity can censor, freeze, or dilute it",
          "Being traded on many exchanges",
          "Having a popular logo"
        ],
        correct: 1
      },
      {
        q: "What is the difference between a CBDC and Bitcoin?",
        options: [
          "CBDCs are decentralized, Bitcoin is not",
          "CBDCs are state-controlled, Bitcoin is permissionless",
          "There is no difference",
          "Bitcoin is only for governments"
        ],
        correct: 1
      },
      {
        q: "What does 'permissionless' mean in Web3?",
        options: [
          "You need approval from a bank",
          "Anyone can participate without needing authorization",
          "Only whitelisted users can operate",
          "Requires KYC to move funds"
        ],
        correct: 1
      },
      {
        q: "Why is on-chain transparency important?",
        options: [
          "It makes the network slower",
          "Any user can verify balances, transactions, and contract logic",
          "It exposes the founder's private data",
          "It is only decorative"
        ],
        correct: 1
      },
      {
        q: "What is the deepest promise of DeFi?",
        options: [
          "Making the founders rich",
          "Building a financial system with rules verifiable by all",
          "Replacing bank apps",
          "Eliminating all financial risk"
        ],
        correct: 1
      }
    ]
  }
];

export default function Quiz() {
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

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = 0.15;
      ambientRef.current.loop = true;
    }
  }, []);

  const level = LEVELS[levelIdx];
  const question = level?.questions[qIdx];

  const connect = async () => {
    if (!window.ethereum) return setMessage("Install MetaMask");
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
      setMessage("Reward claimed! +100 DWALL");
      checkClaimed(account);
    } catch (e) {
      setMessage("Claim error: " + (e.reason || e.message));
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
    maxWidth: '760px',
    margin: '0 auto',
    background: 'rgba(15, 20, 45, 0.88)',
    borderRadius: '20px',
    border: '1px solid rgba(251, 191, 36, 0.25)',
    padding: '2rem',
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
          }}>THE DIAMOND PATH</h2>
          <p style={{color:'rgba(255,255,255,0.55)',letterSpacing:'5px',textTransform:'uppercase',fontSize:'12px',marginTop:'6px'}}>
            Learn. Prove. Earn.
          </p>
          <button onClick={toggleMusic} style={{
            marginTop:'10px',background:'transparent',border:'1px solid rgba(255,255,255,0.2)',
            color:'#fff',padding:'6px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'12px'
          }}>{musicOn ? '🎵 Music On' : '🔇 Music Off'}</button>
        </div>

        {!account ? (
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <button onClick={connect} style={{
              background:'linear-gradient(135deg,#fbbf24,#f59e0b)',color:'#000',border:'none',
              padding:'14px 32px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'16px'
            }}>Connect Wallet</button>
          </div>
        ) : (
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{display:'inline-block',background:'#4ade80',padding:'8px 16px',borderRadius:'10px',color:'#000',fontSize:'13px',fontWeight:600}}>
              ✓ Connected: {account.slice(0,6)}...{account.slice(-4)}
            </div>
            {claimed && <div style={{marginTop:'8px',color:'#4ade80',fontSize:'13px'}}>✓ Airdrop already claimed</div>}
          </div>
        )}

        {step === "intro" && (
          <div>
            <p style={{textAlign:'center',color:'rgba(255,255,255,0.75)',lineHeight:1.6,marginBottom:'1.5rem'}}>
              5 levels. 5 questions each. Answer at least <b>4/5</b> correctly to master a level.
              Complete any level and unlock your on-chain reward: <b style={{color:'#fbbf24'}}>100 $DWALL</b>.
            </p>
            <div style={{display:'grid',gap:'10px'}}>
              {LEVELS.map((l, i) => (
                <button key={l.id} onClick={() => startLevel(i)} style={{
                  background:'rgba(0,0,0,0.35)',color:'#fff',border:`2px solid ${l.color}`,
                  padding:'14px 18px',borderRadius:'10px',textAlign:'left',cursor:'pointer'
                }}>
                  <div style={{fontSize:'11px',color:l.color,letterSpacing:'2px',fontWeight:700}}>LEVEL {i+1}</div>
                  <div style={{fontSize:'18px',fontWeight:700,marginTop:'4px'}}>{l.name}</div>
                  <div style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',marginTop:'2px'}}>{l.subtitle}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "playing" && question && (
          <div>
            <div style={{textAlign:'center',marginBottom:'1rem'}}>
              <div style={{fontSize:'12px',color:level.color,letterSpacing:'3px',fontWeight:700}}>
                LEVEL {levelIdx+1} · {level.name.toUpperCase()}
              </div>
              <div style={{fontSize:'13px',color:'rgba(255,255,255,0.55)',marginTop:'4px'}}>
                Question {qIdx+1} of {level.questions.length}  ·  Score: {score}/{level.questions.length}
              </div>
            </div>
            <h3 style={{fontSize:'22px',fontWeight:700,margin:'1.5rem 0',textAlign:'center',lineHeight:1.4}}>
              {question.q}
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
                  }}>{opt}</button>
                );
              })}
            </div>
            {feedback && (
              <div style={{
                textAlign:'center',marginTop:'1rem',fontSize:'18px',fontWeight:700,
                color: feedback === 'correct' ? '#4ade80' : '#f87171'
              }}>
                {feedback === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
              </div>
            )}
          </div>
        )}

        {step === "result" && (
          <div style={{textAlign:'center'}}>
            <h3 style={{fontSize:'26px',fontWeight:800,color:level.color,marginBottom:'0.5rem'}}>
              {level.name} — Result
            </h3>
            <div style={{fontSize:'48px',fontWeight:900,margin:'1rem 0',color:'#fbbf24'}}>
              {score} / {level.questions.length}
            </div>
            {score >= 4 ? (
              <div>
                <p style={{color:'#4ade80',fontSize:'18px',fontWeight:700,marginBottom:'1rem'}}>
                  🏆 Level mastered!
                </p>
                {account && !claimed && (
                  <button onClick={claimReward} disabled={claiming} style={{
                    background:'#4ade80',color:'#000',border:'none',padding:'14px 32px',
                    borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'16px',marginTop:'10px'
                  }}>{claiming ? "Claiming..." : "Claim 100 DWALL"}</button>
                )}
                {claimed && <p style={{color:'#fbbf24',marginTop:'10px'}}>You've already claimed this airdrop.</p>}
                {!account && <p style={{color:'rgba(255,255,255,0.6)',marginTop:'10px'}}>Connect your wallet to claim.</p>}
              </div>
            ) : (
              <p style={{color:'#f87171',fontSize:'16px'}}>
                Need at least 4/5 to master this level. Try again!
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
              }}>Retry</button>
              <button onClick={() => setStep("intro")} style={{
                background:'transparent',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',
                padding:'10px 20px',borderRadius:'8px',cursor:'pointer'
              }}>Levels</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
