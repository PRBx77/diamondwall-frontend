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
      "9 smart contracts developed",
      "458+ tests passing (92.31% coverage)",
      "Internal audit + AuditAid manual review",
      "CertiK Skynet: 86.27/100 · Zero critical alerts",
      "OpenZeppelin v5 · Ownable2Step · 48h timelocks"
    ]
  },
  {
    id: 2,
    title: "Mainnet & Venus Integration",
    subtitle: "COMPLETED",
    status: "done",
    date: "Q3 2026",
    color: "#4ade80",
    items: [
      "Deployed on BSC Mainnet",
      "All contracts verified on BscScan",
      "Venus Protocol integrated (vBNB yield engine)",
      "Treasury auto-invests presale BNB in Venus",
      "Marketing Treasury fully on-chain"
    ]
  },
  {
    id: 3,
    title: "Airdrop & Community",
    subtitle: "ACTIVE NOW",
    status: "active",
    date: "Q3-Q4 2026",
    color: "#fbbf24",
    items: [
      "100 $DWALL free for first 250 wallets",
      "4 Web3 games as onboarding (Chess, Quiz, Snake, Flight)",
      "On-chain referral system (100 codes, 5%)",
      "WalletConnect: 380+ wallets supported",
      "Community-driven distribution"
    ]
  },
  {
    id: 4,
    title: "Presale",
    subtitle: "COMING SOON",
    status: "next",
    date: "Q4 2026",
    color: "#22d3ee",
    items: [
      "620,000 $DWALL per 1 BNB",
      "700M tokens (70% of supply)",
      "No vesting, instant delivery",
      "Every BNB auto-deposited in Venus in same tx",
      "Referral vesting begins on DEX opening"
    ]
  },
  {
    id: 5,
    title: "Trading & Real Yield",
    subtitle: "AUTO-LAUNCH",
    status: "future",
    date: "Q1 2027",
    color: "#a78bfa",
    items: [
      "Automatic PancakeSwap liquidity from presale close",
      "Real yield distribution to stakers begins",
      "Venus yield harvested atomically on demand",
      "Portfolio tracker listings (CoinGecko / CoinMarketCap)",
      "Launchpad applications (Legion, Finceptor)"
    ]
  },
  {
    id: 6,
    title: "Expansion & Governance",
    subtitle: "ROADMAP AHEAD",
    status: "future",
    date: "Q2 2027 →",
    color: "#f472b6",
    items: [
      "DiamondWall Vaults launch",
      "Additional yield protocols integrated",
      "Multi-sig migration for critical functions",
      "Cross-chain expansion research",
      "On-chain DAO governance (Q4 2027+)"
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
        }}>Strong Hands. Real Yield. Powered by Venus.</p>
      </div>

      <div style={{position: 'relative', paddingLeft: '40px'}}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          background: 'linear-gradient(180deg, #4ade80 0%, #fbbf24 40%, #22d3ee 60%, #a78bfa 80%, #f472b6 100%)'
        }}></div>

        {phases.map((phase, idx) => (
          <div key={phase.id}
            onClick={() => setActive(idx)}
            style={{
              position: 'relative',
              marginBottom: '16px',
              padding: '16px 20px',
              background: active === idx ? `${phase.color}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active === idx ? phase.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: active === idx ? 'translateX(4px)' : 'translateX(0)'
            }}>
            <div style={{
              position: 'absolute',
              left: '-34px',
              top: '20px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: phase.color,
              boxShadow: active === idx ? `0 0 20px ${phase.color}` : `0 0 8px ${phase.color}80`,
              border: '3px solid #0f172a'
            }}></div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px'}}>
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

      {/* Documents section */}
      <div style={{
        marginTop: '2rem',
        padding: '20px',
        background: 'rgba(6, 182, 212, 0.08)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#22d3ee',
          fontWeight: 700,
          letterSpacing: '3px',
          marginBottom: '14px'
        }}>📚 PROJECT DOCUMENTS</div>
        <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
          <a href="/docs/DiamondWall_Whitepaper_v1.0.pdf" target="_blank" rel="noopener noreferrer"
             style={{
               display: 'inline-block',
               padding: '10px 20px',
               background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
               color: '#fff',
               textDecoration: 'none',
               fontWeight: 700,
               fontSize: '14px',
               borderRadius: '8px',
               letterSpacing: '1px'
             }}>📄 Download Whitepaper</a>
          <a href="/docs/DiamondWall_Pitch_Deck_v1.0.pdf" target="_blank" rel="noopener noreferrer"
             style={{
               display: 'inline-block',
               padding: '10px 20px',
               background: 'linear-gradient(135deg, #f59e0b, #d97706)',
               color: '#0f172a',
               textDecoration: 'none',
               fontWeight: 700,
               fontSize: '14px',
               borderRadius: '8px',
               letterSpacing: '1px'
             }}>📊 View Pitch Deck</a>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(245,158,11,0.2)'}}>
        <a href="/airdrop" style={{color: '#fbbf24', textDecoration: 'none', fontWeight: 600, fontSize: '15px', marginRight: '20px'}}>
          🎁 Join Airdrop ↗
        </a>
        <a href="/calculator" style={{color: '#22d3ee', textDecoration: 'none', fontWeight: 600, fontSize: '15px', marginRight: '20px'}}>
          📊 Yield Calculator ↗
        </a>
        <a href="/info" style={{color: '#a78bfa', textDecoration: 'none', fontWeight: 600, fontSize: '15px'}}>
          ℹ️ Info ↗
        </a>
      </div>
    </div>
  );
}
