import { useState, useEffect } from "react";

export default function Calculator() {
  const [bnb, setBnb] = useState(1);
  const [apy, setApy] = useState(13.75);
  const [months, setMonths] = useState(12);

  const BNB_USD = 590;
  const DWALL_PER_BNB = 620000;

  const tokens = bnb * DWALL_PER_BNB;
  const yearlyYield = bnb * (apy / 100);
  const totalYield = yearlyYield * (months / 12);
  const finalValue = bnb + totalYield;

  const fmt = (n) => Math.round(n).toLocaleString();

  return (
    <div style={{
      maxWidth: '640px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'rgba(20, 30, 60, 0.85)',
      borderRadius: '16px',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#fff',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 700,
          margin: '0 0 8px',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '3px'
        }}>$DWALL YIELD CALCULATOR</h2>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
          letterSpacing: '4px',
          textTransform: 'uppercase'
        }}>Real-Yield DeFi · BSC Mainnet</p>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem'}}>
        <span style={{fontSize: '13px', color: 'rgba(255,255,255,0.7)', minWidth: '130px'}}>💰 BNB invested</span>
        <input type="range" min="0.1" max="100" step="0.1" value={bnb}
          onChange={(e) => setBnb(parseFloat(e.target.value))}
          style={{flex: 1, accentColor: '#fbbf24'}} />
        <span style={{fontSize: '14px', fontWeight: 600, minWidth: '80px', textAlign: 'right'}}>{bnb.toFixed(1)} BNB</span>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem'}}>
        <span style={{fontSize: '13px', color: 'rgba(255,255,255,0.7)', minWidth: '130px'}}>📈 APY</span>
        <input type="range" min="8" max="18" step="0.5" value={apy}
          onChange={(e) => setApy(parseFloat(e.target.value))}
          style={{flex: 1, accentColor: '#fbbf24'}} />
        <span style={{fontSize: '14px', fontWeight: 600, minWidth: '80px', textAlign: 'right'}}>{apy.toFixed(2)}%</span>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem'}}>
        <span style={{fontSize: '13px', color: 'rgba(255,255,255,0.7)', minWidth: '130px'}}>📅 Period (months)</span>
        <input type="range" min="1" max="60" step="1" value={months}
          onChange={(e) => setMonths(parseInt(e.target.value))}
          style={{flex: 1, accentColor: '#fbbf24'}} />
        <span style={{fontSize: '14px', fontWeight: 600, minWidth: '80px', textAlign: 'right'}}>{months} mo</span>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '1.5rem'}}>
        <div style={{background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(245,158,11,0.2)'}}>
          <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'}}>$DWALL tokens</div>
          <div style={{fontSize: '22px', fontWeight: 700, color: '#fbbf24'}}>{fmt(tokens)}</div>
          <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px'}}>${fmt(bnb * BNB_USD)}</div>
        </div>
        <div style={{background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(34,211,238,0.2)'}}>
          <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'}}>Total yield (BNB)</div>
          <div style={{fontSize: '22px', fontWeight: 700, color: '#22d3ee'}}>{totalYield.toFixed(3)}</div>
          <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px'}}>${fmt(totalYield * BNB_USD)}</div>
        </div>
        <div style={{background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(74,222,128,0.2)'}}>
          <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'}}>Final value</div>
          <div style={{fontSize: '22px', fontWeight: 700, color: '#4ade80'}}>{finalValue.toFixed(3)}</div>
          <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px'}}>${fmt(finalValue * BNB_USD)}</div>
        </div>
      </div>

      <div style={{textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(245,158,11,0.2)'}}>
        <a href="/airdrop" style={{color: '#fbbf24', textDecoration: 'none', fontWeight: 600, fontSize: '15px'}}>
          🎁 Claim free 100 $DWALL — first 250 wallets ↗
        </a>
      </div>

      <div style={{textAlign: 'center', marginTop: '1rem', fontSize: '11px', color: 'rgba(255,255,255,0.4)'}}>
        Estimation based on 13.75% average APY from Venus + PancakeSwap. Real yields may vary.
      </div>
    </div>
  );
}
