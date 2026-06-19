import { useState } from "react";
import { useLang } from "../i18n/LanguageContext";

const POOLS_DATA = [
  { id: 0, dex: "PancakeSwap", weight: 40, color: "#1fc7d4", icon: "🥞", url: "https://pancakeswap.finance/swap" },
  { id: 1, dex: "BiSwap", weight: 30, color: "#f5b731", icon: "🔄", url: "https://biswap.org/swap" },
  { id: 2, dex: "ApeSwap", weight: 20, color: "#a16552", icon: "🦍", url: "https://apeswap.finance/swap" },
  { id: 3, dex: "BabySwap", weight: 10, color: "#e87b7b", icon: "👶", url: "https://exchange.babyswap.finance/swap" }
];

export default function Pools({ account, signer }) {
  const { t, lang } = useLang();
  const [buyAmount, setBuyAmount] = useState("");

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'1rem'}}>
      <h1 style={{fontSize:'2rem',marginBottom:'0.5rem'}}>
        💎 {lang==='es'?'Pools de Liquidez':'Liquidity Pools'}
      </h1>
      <p style={{color:'#94a3b8',marginBottom:'1.5rem'}}>
        {lang==='es'
          ?'Compra $DWALL directamente en cualquier DEX. Los precios se actualizan en tiempo real según las reservas de cada pool.'
          :'Buy $DWALL directly on any DEX. Prices update in real-time based on each pool reserves.'}
      </p>

      <div className="alert alert-info" style={{marginBottom:'1.5rem'}}>
        ⚠️ {lang==='es'
          ?'Pools en preparación — se activarán tras el cierre de la preventa y deployment en BSC Mainnet.'
          :'Pools in preparation — will be activated after presale close and BSC Mainnet deployment.'}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))',gap:'1.2rem'}}>
        {POOLS_DATA.map(pool => (
          <div key={pool.id} className="card" style={{border:`1px solid ${pool.color}33`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <div>
                <span style={{fontSize:'1.5rem',marginRight:'0.5rem'}}>{pool.icon}</span>
                <span style={{fontSize:'1.2rem',fontWeight:700,color:pool.color}}>{pool.dex}</span>
              </div>
              <span style={{background:pool.color+'22',color:pool.color,padding:'0.3rem 0.8rem',borderRadius:'20px',fontSize:'0.85rem',fontWeight:600}}>
                {pool.weight}% {lang==='es'?'liquidez':'liquidity'}
              </span>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns:'1fr 1fr',marginBottom:'1rem'}}>
              <div className="stat-card" style={{padding:'0.8rem'}}>
                <div className="stat-value" style={{fontSize:'1.1rem',color:'#f59e0b'}}>--</div>
                <div className="stat-label" style={{fontSize:'0.75rem'}}>{lang==='es'?'Precio DWALL/BNB':'Price DWALL/BNB'}</div>
              </div>
              <div className="stat-card" style={{padding:'0.8rem'}}>
                <div className="stat-value" style={{fontSize:'1.1rem',color:'#10b981'}}>--</div>
                <div className="stat-label" style={{fontSize:'0.75rem'}}>{lang==='es'?'Liquidez Total':'Total Liquidity'}</div>
              </div>
            </div>

            <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
              <input
                type="number"
                placeholder={lang==='es'?'BNB a invertir':'BNB to invest'}
                style={{flex:1,padding:'0.6rem',borderRadius:'8px',border:'1px solid #334155',background:'#0f172a',color:'#fff',fontSize:'0.9rem'}}
                value={buyAmount}
                onChange={e => setBuyAmount(e.target.value)}
              />
              <a
                href={pool.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:'0.6rem 1.2rem',
                  background:pool.color,
                  color:'#000',
                  borderRadius:'8px',
                  fontWeight:700,
                  textDecoration:'none',
                  fontSize:'0.9rem',
                  cursor:'pointer'
                }}
              >
                {lang==='es'?'Comprar':'Buy'}
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{marginTop:'1.5rem'}}>
        <div className="card-title">📊 {lang==='es'?'Capitalización Global':'Global Market Cap'}</div>
        <div className="stats-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))'}}>
          <div className="stat-card">
            <div className="stat-value" style={{color:'#f59e0b'}}>--</div>
            <div className="stat-label">{lang==='es'?'Precio Promedio':'Average Price'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:'#10b981'}}>--</div>
            <div className="stat-label">{lang==='es'?'Liquidez Total':'Total Liquidity'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:'#8b5cf6'}}>--</div>
            <div className="stat-label">Market Cap</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:'#ec4899'}}>--</div>
            <div className="stat-label">{lang==='es'?'Volumen 24h':'Volume 24h'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
