import { useState, useEffect } from "react";

const phases = [
  {
    id: 1,
    title: "Development & Audit",
    subtitle: "COMPLETED",
    status: "done",
    date: "Q3 2025 – Q2 2026",
    color: "#4ade80",
    items: [
      "8 smart contracts developed",
      "458 tests passing (92.31% coverage)",
      "Internal security audit — 0 critical vulnerabilities",
      "Frontend & backend infrastructure ready"
    ]
  },
  {
    id: 2,
    title: "Mainnet Deployment",
    subtitle: "COMPLETED",
    status: "done",
    date: "July 2026",
    color: "#4ade80",
    items: [
      "Deployed on BSC Mainnet",
      "Token contract verified on BscScan",
      "Ecosystem live and operational",
      "Marketing Treasury fully on-chain"
    ]
  },
  {
    id: 3,
    title: "Airdrop Live",
    subtitle: "ACTIVE NOW",
    status: "active",
    date: "July 2026",
    color: "#fbbf24",
    items: [
      "100 $DWALL free for first 250 wallets",
      "Tweet + Verify + Claim flow",
      "On-chain verification",
      "Community-driven distribution"
    ]
  },
  {
    id: 4,
    title: "Presale",
    subtitle: "COMING SOON",
    status: "next",
    date: "Q3 2026",
    color: "#22d3ee",
    items: [
      "620,000 $DWALL per 1 BNB",
      "700M tokens (70% of supply)",
      "No vesting, instant delivery",
      "BNB deployed to Venus + PancakeSwap"
    ]
  },
  {
    id: 5,
    title: "Trading & Liquidity",
    subtitle: "AUTO-LAUNCH",
    status: "future",
    date: "Q4 2026",
    color: "#a78bfa",
    items: [
      "Automatic liquidity from presale close",
      "4 pools deployed on PancakeSwap",
      "20% reserved for CEX listings (timelock)",
      "10% monthly drip for stability"
    ]
  },
  {
    id: 6,
    title: "Real Yield Distribution",
    subtitle: "SUSTAINED",
    status: "future",
    date: "Ongoing",
    color: "#f472b6",
    items: [
      "Yields from Venus (~15% APY)",
      "Yields from PancakeSwap LP fees",
      "Distributed on-chain to holders",
      "Fully transparent + auditable"
    ]
  }
];

export default function Roadmap() {
  const [active, setActive] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % phases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      maxWidth: '900px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'rgba(20, 30, 60, 0.85)',
      borderRadius: '16px',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#fff',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{textAlign: 'center', marginBottom: '2rem'}}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 700,
          margin: '0 0 8px',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '3px'
        }}>$DWALL ROADMAP</h2>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
          letterSpacing: '4px',
          textTransform: 'uppercase'
        }}>From Zero to Real-Yield DeFi</p>
      </div>

      <div style={{position: 'relative', paddingLeft: '40px'}}>
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '15px',
          bottom: '15px',
          width: '2px',
          background: 'linear-gradient(180deg, #4ade80 0%, #fbbf24 40%, #22d3ee 60%, #a78bfa 80%, #f472b6 100%)'
        }} />

        {phases.map((phase, idx) => (
          <div
            key={phase.id}
            onClick={() => setActive(idx)}
            style={{
              position: 'relative',
              marginBottom: '1.5rem',
              padding: '1rem 1.5rem',
              background: active === idx ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              border: `1px solid ${active === idx ? phase.color : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              transform: active === idx ? 'scale(1.02)' : 'scale(1)',
              boxShadow: active === idx ? `0 0 30px ${phase.color}30` : 'none'
            }}
          >
            <div style={{
              position: 'absolute',
              left: '-30px',
              top: '20px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: phase.color,
              border: '3px solid rgba(20, 30, 60, 1)',
              boxShadow: active === idx ? `0 0 15px ${phase.color}` : 'none',
              transition: 'all 0.4s'
            }} />

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
              <div>
                <div style={{
                  fontSize: '11px',
                  color: phase.color,
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: '4px'
                }}>
                  PHASE {phase.id} · {phase.subtitle}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#fff'
                }}>{phase.title}</h3>
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'right'
              }}>{phase.date}</div>
            </div>

            {active === idx && (
              <ul style={{
                margin: '12px 0 0',
                paddingLeft: '18px',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.8'
              }}>
                {phase.items.map((item, i) => (
                  <li key={i} style={{marginBottom: '4px'}}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div style={{textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(245,158,11,0.2)'}}>
        <a href="/airdrop" style={{color: '#fbbf24', textDecoration: 'none', fontWeight: 600, fontSize: '15px', marginRight: '20px'}}>
          🎁 Join Airdrop ↗
        </a>
        <a href="/calculator" style={{color: '#22d3ee', textDecoration: 'none', fontWeight: 600, fontSize: '15px'}}>
          📊 Yield Calculator ↗
        </a>
      </div>
    </div>
  );
}
